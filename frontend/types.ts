export type Product = {
  id: number; sku: string; name: string; category: string;
  stock: number; price: number; reorder_point: number;
};
export type NewProduct = Omit<Product, "id">;
