const charid = window.location.href.match(/https:\/\/www\.dndbeyond\.com\/characters\/(\d+)/)[1];
fetch(`https://character-service.dndbeyond.com/character/v5/character/${charid}?includeCustomItems=true`).then(r => r.text()).then(content => {
    const char = JSON.parse(content).data;
    const charname = char.name;
    const charclass = char.classes.length > 1 ? 
        ("multi" + char.classes.map(c => c.definition.name).join('')) :
        char.classes[0].definition.name;
    const exportName = `${charclass}_${charname.replace(" ", "_")}.json`;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(content);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});