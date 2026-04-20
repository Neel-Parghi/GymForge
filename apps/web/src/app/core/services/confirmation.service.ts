import { ApplicationRef, ComponentRef, EnvironmentInjector, Injectable, createComponent, inject } from '@angular/core';
import { ConfirmationPopupComponent } from '../../shared/components/confirmation-popup-component/confirmation-popup-component';

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private componentRef?: ComponentRef<ConfirmationPopupComponent>;

  confirm(options: ConfirmOptions = {}): Promise<boolean> {
    return new Promise((resolve) => {
      this.componentRef = createComponent(ConfirmationPopupComponent, {
        environmentInjector: this.injector
      });

      if (options.title) this.componentRef.instance.title = options.title;
      if (options.message) this.componentRef.instance.message = options.message;
      if (options.confirmText) this.componentRef.instance.confirmText = options.confirmText;
      if (options.cancelText) this.componentRef.instance.cancelText = options.cancelText;
      if (options.type) this.componentRef.instance.type = options.type;

      this.appRef.attachView(this.componentRef.hostView);

      const domElem = (this.componentRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);

      setTimeout(() => {
        if (this.componentRef) this.componentRef.instance.isOpen = true;
      }, 0);

      this.componentRef.instance.confirm.subscribe(() => {
        this.cleanup(true, resolve);
      });

      this.componentRef.instance.cancel.subscribe(() => {
        this.cleanup(false, resolve);
      });
    });
  }

  private cleanup(result: boolean, resolve: (val: boolean) => void) {
    if (!this.componentRef) return;

    this.componentRef.instance.isOpen = false;

    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = undefined;
      resolve(result);
    }
  }
}
