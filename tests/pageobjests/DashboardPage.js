export class DashboardPage {

    constructor(page) {
        this.page = page;
        this.wgtList = page.locator(".create-list-content");
        this.txtTitle = page.locator("#title");
        this.txtDescription = page.locator("#description");
        this.rbtnColor = page.locator('[data-testid="color-option-28a745"]');
        this.btnCreateList = page.locator("[type='submit']");

    }

    async createNewItem(title, description) {
        await this.wgtList.click();
        await this.txtTitle.fill(title);
        await this.txtDescription.fill(description);
        await this.rbtnColor.click();
        await this.btnCreateList.click();
    }

    async editExistingItem(title, updatedTitle) {
        const card = this.page.locator('.list-card').filter({ hasText: title });

        await card.hover();
        await card.locator("[data-testid*='edit-list-btn']").click();
        // Fill in the new title
        await this.txtTitle.fill(updatedTitle);
        await this.btnCreateList.click();
    }


     async deleteExistingItem(title) {
        const card = this.page.locator('.list-card').filter({ hasText: title });
        await card.hover();
        await card.locator("[data-testid*='delete-list-btn']").click();       
   
  }

}
module.exports = DashboardPage;