const getJsonUpload = async () => {
    const inputFileElem = document.createElement('input');
    inputFileElem.setAttribute('type', 'file');
    inputFileElem.setAttribute('accept', '.json');
    const inputChanged = new Promise(
        resolve => inputFileElem.addEventListener('change', resolve, false)
    );
    inputFileElem.click();
    const fileChangeEvent = await inputChanged;
    const { files } = fileChangeEvent.target;
    if (!files) { return }
    const fileText = await files[0].text();
    return JSON.parse(fileText);
}

const fetchJson = async () => {
    
}

export { getJsonUpload }