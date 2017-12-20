import { SamplewebPage } from './app.po';

describe('sampleweb App', () => {
  let page: SamplewebPage;

  beforeEach(() => {
    page = new SamplewebPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
