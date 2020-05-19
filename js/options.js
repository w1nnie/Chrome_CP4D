function save_options() {
    let cs = document.getElementById('color-space').value;
    let cf = document.getElementById('color-format').value;
    let sz = document.getElementById('popup-size').value;
    chrome.storage.sync.set({
        colorSpace: cs,
        colorFormat: cf,
        popupSize: sz
    }, function() {
        let status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function(){
            status.textContent = '';
        }, 750)
    });
}

function restore_options() {
    chrome.storage.sync.get({
        colorSpace: 'HSV',
        colorFormat: 'HexRGB',
        popupSize: '250'
    }, function(items) {
        document.getElementById('color-space').value = items.colorSpace;
        document.getElementById('color-format').value = items.colorFormat;
        document.getElementById('popup-size').value = items.popupSize;
        console.log(items.popupSize);
        if(items.colorSpace == 'HSL'){
            document.getElementById('HS').textContent = 'HSL';
        }
    });
}


document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',save_options);

let cs = document.getElementById('color-space');
cs.addEventListener('change', (e) => {
    let hs = document.getElementById('HS');
    if (cs.value == 'HSV'){
        hs.textContent = 'HSV';
    } else if (cs.value == 'HSL') {
        hs.textContent = 'HSL';
    }
});