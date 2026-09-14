<!--src/modules/purchasing/views/bills/components/BillPaymentModal.vue-->
<template>
  <VoucherModal
    :model-value="isOpen"
    @update:model-value="$emit('update:isOpen', $event)"
    type="payment"
    :prefill-data="voucherPrefill"
    @saved="handleSaved"
    @close="$emit('update:isOpen', false)"
  />
</template>

<script setup>
import { computed } from 'vue'
import VoucherModal from '@/modules/accounting/views/vouchers/components/VoucherModal.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  billId: { type: [Number, String], default: null },
  billNumber: { type: String, default: '' },
  supplierId: { type: [Number, String], default: null },
  supplierName: { type: String, default: '' },
  supplierAccountId: { type: [Number, String], default: null },
  currencyId: { type: [Number, String], default: null },
  remainingAmount: { type: Number, default: 0 },
})

const emit = defineEmits(['update:isOpen', 'success'])

const voucherPrefill = computed(() => ({
  payee_name: props.supplierName,
  description: `سداد فاتورة مشتريات رقم: ${props.billNumber}`,
  amount: props.remainingAmount,
  currency_id: props.currencyId,
  reference_label: `فاتورة: ${props.billNumber}`,
  details: [
    {
      account_id: props.supplierAccountId,
      account_name: props.supplierName,
      amount: props.remainingAmount,
      description: `دفعة سداد على فاتورة رقم: ${props.billNumber}`,
      party_type: 'App\\Modules\\Core\\Models\\Partner',
      party_id: props.supplierId ? String(props.supplierId) : null,
      reference_type: 'App\\Modules\\Purchasing\\Models\\PurchaseBill',
      reference_id: props.billId ? Number(props.billId) : null,
      reference_label: `فاتورة #${props.billNumber}`,
    },
  ],
}))

const handleSaved = (voucher) => {
  emit('success', voucher)
  emit('update:isOpen', false)
}
</script>
