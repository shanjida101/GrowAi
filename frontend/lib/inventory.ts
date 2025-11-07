export type Product = { id:number; sku:string; name:string; category?:string; stock:number; price:number; reorder_point:number };
export function lowStock(products: Product[]) {
  return products.filter(p => p.stock <= p.reorder_point).sort((a,b)=> (a.stock - a.reorder_point) - (b.stock - b.reorder_point));
}
