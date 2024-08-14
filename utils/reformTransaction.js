export const reformTransaction = (transaction) => {
  return {
    id: transaction.id,
    total: transaction.total,
    status: transaction.status,
    customerName: transaction.customerName,
    customerEmail: transaction.customerEmail,
    customerPhone: transaction.customerPhone,
    customerTableNumber: transaction.customerTableNumber,
    snapToken: transaction.snapToken,
    snapRedirectUrl: transaction.snapRedirectUrl,
    paymentMethod: transaction.paymentMethod,
    products: transaction.transactionsItems.map((transactionItem) => ({
      id: transactionItem.productId,
      name: transactionItem.productName,
      price: transactionItem.price,
      quantity: transactionItem.quantity,
      image: transactionItem.product.image,
    })),
  };
};
