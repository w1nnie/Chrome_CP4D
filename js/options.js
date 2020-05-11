function save_options() {
    let cs = document.getElementById('color-space').value;
    let cf = document.getElementById('color-format').value;
    chrome.storage.sync.set({
        colorSpace: cs,
        colorFormat: cf
    }, function() {
        let status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function(){
            status.textcontent = '';
        }, 750)
    });
}

function restore_options() {
    chrome.storage.sync.get({
        colorSpace: 'HSV',
        colorFormat: 'HexRGB'
    }, function(items) {
        document.getElementById('color-space').value = items.colorSpace;
        document.getElementById('color-format').value = items.colorFormat;
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