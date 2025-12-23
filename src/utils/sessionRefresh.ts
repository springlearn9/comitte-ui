// Simple callback mechanism to refresh session from services
class SessionRefreshManager {
  private callback: (() => void) | null = null;

  setCallback(cb: () => void) {
    this.callback = cb;
  }

  refresh() {
    if (this.callback) {
      this.callback();
    }
  }

  clear() {
    this.callback = null;
  }
}

export const sessionRefresh = new SessionRefreshManager();
