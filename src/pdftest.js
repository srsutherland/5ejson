import { PDFDocument, PDFTextField, PDFCheckBox, rgb } from 'https://cdn.skypack.dev/pdf-lib';

const colors = {
    'red': rgb(1, 0, 0),
    'orange': rgb(1, 0.5, 0),
    'yellow': rgb(1, 1, 0),
    'green': rgb(0, 1, 0),
    'cyan': rgb(0, 1, 1),
    'blue': rgb(0, 0, 1),
    'purple': rgb(1, 0, 1),
}

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
                    c_index++;
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

async function fillForm(filename, jmap, chardata) {
    //Helper functions
    const modString = mod => mod >= 0 ? `+${mod}` : `${mod}`
    const modFromScore = score => modString(Math.floor((score-10)/2))

    const formPdfBytes = fetch(filename).then((res) => res.arrayBuffer());
    const mappingFetch = fetch(jmap).then((res) => res.json());
    
    const pdfDoc = await PDFDocument.load(await formPdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    const mapping = await mappingFetch;
    const char = chardata;
    for (const [key, value] of Object.entries(mapping)) {
        const field = fields.find(f => f.getName() === key);
        if (field instanceof PDFTextField) {
            console.log(`${key}: ${value}`);
            // evil eval
            field.setText(`${eval(value)}`);
        }
        if (field instanceof PDFCheckBox) {
            console.log(`${key}: ${value}`);
            const isChecked = eval(value);
            if (isChecked === true) {
                field.check();
            } else if (isChecked === false) {
                field.check();
                field.uncheck();
            }
        }
            
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url);
}

window.listFieldNames = listFieldNames;
window.annotateFieldNames = annotateFieldNames;
window.fillForm = fillForm;

export { listFieldNames, annotateFieldNames, fillForm };
