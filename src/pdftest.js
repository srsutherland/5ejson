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

window.listFieldNames = listFieldNames;
window.annotateFieldNames = annotateFieldNames;
