export class LoginPage {
    constructor(page) {
        this.page = page;
        this.txtUsername = page.locator("#email");
        this.txtPassword = page.locator("#password");
        this.btnLogin = page.locator("[data-testid=login-submit-btn]");
        this.tstSuccess = page.locator("#nht_toaster [role='status']");    
                
    }

    async landingPage() {
        await this.page.goto("https://taskflow-frontend-r624.onrender.com/login");       

    }
    
        async validLogin(username, password) {
        await this.txtUsername.fill(username);
        await this.txtPassword.fill(password);
        await this.btnLogin.click();

    }

     async invalidLogin(username, password) {
        await this.txtUsername.fill(username);
        await this.txtPassword.fill(password);
        await this.btnLogin.click();

    }
}
module.exports = LoginPage;