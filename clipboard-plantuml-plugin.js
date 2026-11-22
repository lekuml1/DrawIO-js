/**
 * Draw.io Plugin: Paste Clipboard as PlantUML
 * คีย์ลัด: Alt + P
 */
Draw.loadPlugin(function(ui) {
    var graph = ui.editor.graph;
    var actionName = 'pastePlantUmlFromClipboard';

    // 1. ลงทะเบียน Action
    ui.actions.addAction(actionName, function() {
        if (!navigator.clipboard || !navigator.clipboard.readText) {
            showFallbackManualDialog(ui);
            return;
        }

        navigator.clipboard.readText().then(function(text) {
            text = (text || '').trim();

            if (!text) {
                ui.showError('Clipboard ว่างเปล่า', 'ไม่พบข้อความในคลิปบอร์ด กรุณา Copy โค้ด PlantUML ก่อนครับ', 'ตกลง');
                return;
            }

            // ตรวจสอบแท็ก PlantUML
            var pumlCode = text;
            if (!pumlCode.includes('@startuml')) {
                pumlCode = '@startuml\n' + pumlCode;
            }
            if (!pumlCode.includes('@enduml')) {
                pumlCode = pumlCode + '\n@enduml';
            }

            insertPlantUmlToDiagram(ui, pumlCode);

        }).catch(function(err) {
            // กรณีติดสิทธิ์ Browser Permission
            showFallbackManualDialog(ui);
        });
    });

    // 2. ผูกคีย์ลัด Alt + P (KeyCode 80 = 'P')
    ui.keyHandler.bindAction(80, true, actionName);

    // 3. เพิ่มเมนูบนแถบเมนูหลัก
    ui.menubar.addMenu('⚡ AI / Tools', function(menuObj, parent) {
        ui.menus.addItem(menuObj, '📋 วางและสร้าง PlantUML จาก Clipboard (Alt+P)', null, function() {
            ui.actions.get(actionName).funct();
        }, parent);
    });

    /**
     * ฟังก์ชันเรียกกล่องโต้ตอบหรือแทรก PlantUML
     */
    function insertPlantUmlToDiagram(ui, code) {
        try {
            var action = ui.actions.get('plantUml');
            if (action) {
                action.funct();
                setTimeout(function() {
                    var textarea = document.querySelector('.geDialog textarea');
                    if (textarea) {
                        textarea.value = code;
                        var evt = document.createEvent('HTMLEvents');
                        evt.initEvent('input', true, true);
                        textarea.dispatchEvent(evt);
                    }
                }, 100);
            }
        } catch (e) {
            console.error('Error inserting PlantUML:', e);
        }
    }

    /**
     * กล่องสำรองกรณีเบราว์เซอร์บล็อกการอ่าน Clipboard
     */
    function showFallbackManualDialog(ui) {
        var container = document.createElement('div');
        container.style.padding = '14px';

        var title = document.createElement('h4');
        title.innerText = 'วางโค้ด PlantUML ที่นี่';
        title.style.margin = '0 0 10px 0';
        container.appendChild(title);

        var textarea = document.createElement('textarea');
        textarea.style.width = '100%';
        textarea.style.height = '140px';
        textarea.style.boxSizing = 'border-box';
        textarea.placeholder = 'กด Ctrl+V เพื่อวางโค้ด...';
        container.appendChild(textarea);

        var btnBar = document.createElement('div');
        btnBar.style.textAlign = 'right';
        btnBar.style.marginTop = '10px';

        var cancelBtn = mxUtils.button('ยกเลิก', function() { ui.hideDialog(); });
        cancelBtn.className = 'geBtn';
        cancelBtn.style.marginRight = '8px';

        var okBtn = mxUtils.button('สร้าง Diagram', function() {
            var val = textarea.value.trim();
            if (val) insertPlantUmlToDiagram(ui, val);
            ui.hideDialog();
        });
        okBtn.className = 'geBtn gePrimaryBtn';

        btnBar.appendChild(cancelBtn);
        btnBar.appendChild(okBtn);
        container.appendChild(btnBar);

        var dlg = new CustomDialog(ui, container);
        ui.showDialog(dlg.container, 400, 240, true, true);
        textarea.focus();
    }
});
