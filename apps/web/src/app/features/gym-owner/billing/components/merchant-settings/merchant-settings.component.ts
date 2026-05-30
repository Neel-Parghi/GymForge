import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-merchant-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './merchant-settings.component.html',
  styleUrls: ['./merchant-settings.component.scss']
})
export class MerchantSettingsComponent implements OnInit, OnChanges {
  @Input() enableOnlineMemberPayments = true;
  @Input() merchantUpiVpa = 'fitlife@okaxis';
  @Input() razorpayKeyId = '';
  @Input() razorpaySecretKey = '';

  @Output() enableOnlineMemberPaymentsChange = new EventEmitter<boolean>();
  @Output() merchantUpiVpaChange = new EventEmitter<string>();
  @Output() razorpayKeyIdChange = new EventEmitter<string>();
  @Output() razorpaySecretKeyChange = new EventEmitter<string>();
  @Output() saveSettings = new EventEmitter<{
    enableOnlineMemberPayments: boolean;
    merchantUpiVpa: string;
    razorpayKeyId: string;
    razorpaySecretKey: string;
  }>();

  merchantForm!: FormGroup;
  showRazorpayKeys = false;

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.merchantForm) {
      if (changes['enableOnlineMemberPayments']) {
        this.merchantForm.patchValue({ enableOnlineMemberPayments: this.enableOnlineMemberPayments }, { emitEvent: false });
      }
      if (changes['merchantUpiVpa']) {
        this.merchantForm.patchValue({ merchantUpiVpa: this.merchantUpiVpa }, { emitEvent: false });
      }
      if (changes['razorpayKeyId']) {
        this.merchantForm.patchValue({ razorpayKeyId: this.razorpayKeyId }, { emitEvent: false });
      }
      if (changes['razorpaySecretKey']) {
        this.merchantForm.patchValue({ razorpaySecretKey: this.razorpaySecretKey }, { emitEvent: false });
      }
    }
  }

  private initForm(): void {
    this.merchantForm = new FormGroup({
      enableOnlineMemberPayments: new FormControl(this.enableOnlineMemberPayments),
      merchantUpiVpa: new FormControl(this.merchantUpiVpa, [Validators.required]),
      razorpayKeyId: new FormControl(this.razorpayKeyId, [Validators.required]),
      razorpaySecretKey: new FormControl(this.razorpaySecretKey, [Validators.required])
    });

    this.merchantForm.get('enableOnlineMemberPayments')?.valueChanges.subscribe(val => {
      this.enableOnlineMemberPayments = val;
      this.enableOnlineMemberPaymentsChange.emit(val);
    });

    this.merchantForm.get('merchantUpiVpa')?.valueChanges.subscribe(val => {
      this.merchantUpiVpa = val;
      this.merchantUpiVpaChange.emit(val);
    });

    this.merchantForm.get('razorpayKeyId')?.valueChanges.subscribe(val => {
      this.razorpayKeyId = val;
      this.razorpayKeyIdChange.emit(val);
    });

    this.merchantForm.get('razorpaySecretKey')?.valueChanges.subscribe(val => {
      this.razorpaySecretKey = val;
      this.razorpaySecretKeyChange.emit(val);
    });
  }

  toggleRazorpayKeysVisibility(): void {
    this.showRazorpayKeys = !this.showRazorpayKeys;
  }

  onSubmit(): void {
    if (this.merchantForm.valid) {
      this.saveSettings.emit(this.merchantForm.value);
    }
  }
}
