import { PDFDocument, PDFTextField } from 'https://cdn.skypack.dev/pdf-lib';

async function listFieldNames(filename) {
    const formPdfBytes = await fetch(filename).then((res) => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(formPdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    fields.forEach((field) => {
        const fieldName = field.getName();
        const widgets = field.acroField.getWidgets();
        if (widgets && widgets.length > 0) {
            const rect = widgets[0].getRectangle();
            const coords = Object.entries(rect).map(p => `${p[0]}:${Math.round(p[1])}`).join(', ')
            console.log(`${fieldName}: (${coords}})`);
        } else {
            console.log(`${fieldName}: unknown`);
        }
    });
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
