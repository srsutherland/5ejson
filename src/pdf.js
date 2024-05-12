import { PDFDocument, PDFTextField, PDFCheckBox, rgb } from 'https://cdn.skypack.dev/pdf-lib';

async function listFieldNames(filename) {
    const formPdfBytes = await fetch(filename).then((res) => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(formPdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    const list = {};
    fields.forEach((field) => {
        const fieldName = field.getName();
        const widgets = field.acroField.getWidgets();
        if (widgets && widgets.length > 0) {
            const rect = widgets[0].getRectangle();
            const coords = Object.entries(rect).map(p => `${p[0]}:${Math.round(p[1])}`).join(', ');
            console.log(`${fieldName}: (${coords}})`);
            list[fieldName] = rect;
        } else {
            console.log(`${fieldName}: unknown`);
            list[fieldName] = 'unknown';
        }
    });
    return list;
}

async function annotateFieldNames(filename) {
    const formPdfBytes = await fetch(filename).then((res) => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(formPdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    fields.forEach((field) => {
        const fieldName = field.getName();
        if (field instanceof PDFTextField) {
            field.setText(fieldName);
        }
        if (field instanceof PDFCheckBox) {
            const widgets = field.acroField.getWidgets();
            if (widgets && widgets.length > 0) {
                try {
                    const rect = widgets[0].getRectangle();
                    const checkboxFontSize = 8;
                    const checkboxTextOffset = 2;

                    const page = pdfDoc.getPage(0);
                    const text = `${fieldName}`;
                    const textWidth = 20
                    const textX = rect.x - checkboxTextOffset - textWidth;
                    const textY = rect.y + rect.height / 2 - checkboxFontSize / 2;

                    const textColor = rgb(1, 0, 0); // Red color
                    page.drawText(text, {
                        x: textX,
                        y: textY,
                        size: checkboxFontSize,
                        color: textColor,
                        lineHeight: 1,
                        opacity: 1,
                        horizontalAlign: 'right',
                        verticalAlign: 'middle',
                    });

                    field.check();
                } catch (e) {
                    console.log(e);
                }
            }
        }
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url);
}

const chainableEmptyString = new Proxy({}, {
    get: (target, prop) => {
        if (prop === Symbol.toPrimitive) {
            return () => '';
        }
        if (typeof prop === 'string' && (prop === 'toString' || prop === 'valueOf')) {
            return () => '';
        }
        return chainableEmptyString;
    },
    apply: function() {
        return '';
    }
});

class SafeIter {
    constructor(iterable) {
        this.iterable = iterable;
        this.index = -1;
    }

    next() {
        this.index++;
        this.current = this.iterable[this.index];
        if (this.current == undefined) {
            this.current = chainableEmptyString;
        }
        return this.current;
    }

    curr() {
        return this.current;
    }
}

async function fillForm(pdf_filename, jmap_filename, chardata, logFunc=undefined) {
    const log = logFunc || console.log;
    // Gets used by eval
    // eslint-disable-next-line no-unused-vars
    const char = chardata;
    // eslint-disable-next-line no-unused-vars
    const vars = {};
    // Helper functions, for use in eval
    const modString = mod => (mod ?? 0) >= 0 ? `+${mod}` : `${mod}`
    // eslint-disable-next-line no-unused-vars
    const modFromScore = score => modString(Math.floor((score-10)/2))
    // eslint-disable-next-line no-unused-vars
    const modOrEmpty = score => typeof score === "number" ? modString(score) : ''

    const formPdfBytes = fetch(pdf_filename).then((res) => res.arrayBuffer());
    const mappingFetch = fetch(jmap_filename).then((res) => res.json());
    
    const pdfDoc = await PDFDocument.load(await formPdfBytes);
    log(pdf_filename + ' loaded');
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    log('Fields loaded');

    const mapping = await mappingFetch;
    log(jmap_filename + ' loaded');
    
    for (const [key, value] of Object.entries(mapping)) {
        const field = fields.find(f => f.getName() === key);
        if (!field) {
            const isDeclaration = key.startsWith("=")
            const isComment = key.startsWith("//") || key.startsWith("/*")
            if (isDeclaration) {
                eval(value)
            } else if (!isComment) {
                console.warn(`Field ${key} not found`);
            }
            continue;
        }
        if (field instanceof PDFTextField) {
            log(`${key}: ${value}`);
            // evil eval
            field.setText(`${eval(value)}`);
        }
        if (field instanceof PDFCheckBox) {
            log(`${key}: ${value}`);
            // evil eval
            const isChecked = eval(value);
            if (isChecked === true) {
                field.check();
            } else if (isChecked === false) {
                field.check();
                field.uncheck();
            }
        }
    }
    log('Fields filled, saving PDF');

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url);
    log('PDF opened in new tab');
}

window.listFieldNames = listFieldNames;
window.annotateFieldNames = annotateFieldNames;
window.fillForm = fillForm;

export { listFieldNames, annotateFieldNames, fillForm };
