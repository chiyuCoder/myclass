export class SelectTable {
    public boxId: string;
    protected itemSelector: string;
    protected allSelector: string;
    public autoSelect: boolean = true;
    public selecteds: string[] | HTMLElement[] = [];
    protected allHasSelected: boolean;
    constructor(boxId, autoSelect = true) { 
        this.boxId = boxId;
        this.itemSelector = `[selectbox-id="${boxId}"][selectbox-type="item"]`;
        this.allSelector = `[selectbox-id="${boxId}"][selectbox-type="all"]`; 
        this.autoSelect = autoSelect;
        this.__init();
        this.checkAllSelector(true);
    }
    __init() {
        this.whenAllClick();
        this.whenOneClick();
    }
    whenAllClick() {
        let selectTable = this;
        $(selectTable.allSelector).on('click', function() {
            let status = $(this).attr('check-status');
            if (status == 'checked') {
                status = 'false';
                $(this).trigger('SelectTable.allUnSelected');
            } else {
                status = 'checked';
                $(this).trigger('SelectTable.allSelected');
            }
            $(this).attr('check-status', status);
            $(selectTable.itemSelector).attr('check-status', status);
        });
    }
    whenOneClick() {
        let selectTable = this;
        $(selectTable.itemSelector).on('click', function() {
            let status = $(this).attr('check-status');
            if (status == 'checked') {
                status = 'false';
            } else {
                status = 'checked';
            }
            $(this).attr('check-status', status);   
            selectTable.checkAllSelector(selectTable.autoSelect);
        });
    }
    getAllSelectors(attr = ''): string[] | HTMLElement[] {
        let selectTable = this;
        selectTable.selecteds = [];
        $(`${selectTable.itemSelector}[check-status="checked"]`).each(function (index, elm) {
            if (!attr) {
                (<HTMLElement[]>selectTable.selecteds).push(elm);
            }  else {
                let val = $(elm).attr(attr);
                (<string[]>selectTable.selecteds).push(val);
            }                         
        });
        return selectTable.selecteds;
    }
    checkAllSelector(autoSelect = true) {
        let selectTable = this;
        selectTable.allHasSelected = true;
        $(selectTable.itemSelector).each(function (index, elm) {
            if (($(elm).attr('check-status') != 'checked') && $(elm).attr('check-status') != 'true') {
                selectTable.allHasSelected = false;
            }                  
        });
        if (autoSelect) {
            if (selectTable.allHasSelected && $(selectTable.itemSelector).length > 0) {
                this.select(this.allSelector);
            } else {
                this.unselect(this.allSelector);
            }
        }
        return selectTable.allHasSelected;
    }
    select(div) {
        $(div).attr('check-status', 'checked');
    }
    unselect(div) {
        $(div).removeAttr('check-status');
    }
}