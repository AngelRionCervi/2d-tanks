export class MapDownloader {
    constrctor() {

    }

    downloadMap(map, exportName) {
        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(map));
        let downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}