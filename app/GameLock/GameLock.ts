import "./GameLock.less";
import { local } from "../StUrl/StUrl";
import { stCookie } from "../StCookie/StCookie";
import { getProperEvtName } from "../../func/obj";
import { BulletScreen } from "../BulletScreen/BulletScreen";
type status = "on" | "off";
interface IGame {
    start();
}
let bulletScreen = new BulletScreen();
export class GameLock {
    public cookieKey: string = local.getQueryValue("acid") + '_game_lock';
    private status: status = "on";
    private password: string;
    readonly submitKeyCode: number = 13;
    public bindGame: IGame;
    constructor() {
    }
    getStatus() {
        this.status = <status>stCookie.getItem(this.cookieKey);
        if (!this.status) {
            this.status = "on";
        }
        return this.status;
    }
    setStatus(newStaus: status) {
        this.status = newStaus;
        return stCookie.setItem(this.cookieKey, newStaus);
    }
    init() {
        if (this.getStatus() == 'off') {
            this.rebuildGameEnv();
        } else {
            this.setStatus('on');
            this.getPassword();
            this.lockGame();
        }
    }
    getHtml(): string {
        return `
            <div id="st-lock" class="st-lock-row">
                <div class="center-middle">
                    <div class="pbrow">
                        <input type="password" class="st-lock-password" placeholder="请输入活动密码">
                    </div>
                    <div class="pbrow">
                        <button type="button" class="st-lock-to-unlock">开启</button>
                    </div>
                </div>
            </div>
        `;
    }
    listenAnimeEnd() {
        let evtName = getProperEvtName('animationend');
        $("#st-lock").on(evtName, function () {
            if ($(this).hasClass("error")) {
                $(this).removeClass("error");
            }
        });
    }
    listenClick() {
        let gameLock = this;
        $(document.body).on('click', '#st-lock .st-lock-to-unlock', function () {
            gameLock.toUnlock();
        }); 
        $(document).on('keydown', function (event) {
            if (event.keyCode == gameLock.submitKeyCode) {
                gameLock.toUnlock();
            }
        });
    }
    installLock() {
        let lock = this.getHtml();
        $(document.body).append(lock);
        this.listenAnimeEnd();
        this.listenClick();
    }
    hasInstallLock(): boolean {
        let elm = document.getElementById("st-lock");
        if (elm) {
            return true;
        } else {
            return false;
        }
    }
    showLock() {
        $('#st-lock').fadeIn();
    }
    lockGame() {
        if (this.hasInstallLock()) {
            this.showLock();
        } else {
            this.installLock();
        }
    }
    getPassword() {
        let gameLock = this;
        $.ajax({
            url: local.updateTpAction('setting-show-login').getPart("href"),
            success(reply) {
                gameLock.password = reply;
            },
            error(err) {
                console.error(err);
            }
        });
    }
    rebuildGameEnv() {
        bulletScreen.init();
        this.destoryed();
        if (this.bindGame) {
            this.bindGame.start();
        }
    }
    unlockBy(text: string) {
        if (text == this.password) {
            this.unlock();
        } else {
            console.log('error in password');
            this.error();
        }
    }
    unlock() {
        $('#st-lock').removeClass('error');
        this.setStatus('off');
        $('#st-lock').fadeOut();
        this.rebuildGameEnv();
    }
    error() {
        $('#st-lock').addClass('error');
    }
    toUnlock() {
        if (this.getStatus() == 'off') {
            return ;
        }
        let text = <string>$('#st-lock .st-lock-password').val();
        this.unlockBy(text);
    }
    destoryed() {};
}