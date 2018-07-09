let now = new Date();
class TimeInput{
    public singleOptions = {
        locale: {
            format: 'YYYY/MM/DD',
            startDate: new Date(),
            daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            firstDay: 0
        },
        singleDatePicker: true,
        showDropdowns: true,
    }
    constructor(){

    }
}