import { useMemo, useState } from "react";
import "./styles.css";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

const INITIAL_BALANCE = 100_000_000_000;

const PRODUCTS: Product[] = [
  { id: "big-mac", name: "Big Mac", price: 5, image: "https://neal.fun/spend/images/big-mac.jpg" },
  { id: "amazon-echo", name: "Amazon Echo", price: 99, image: "https://neal.fun/spend/images/amazon-echo.jpg" },
  { id: "airpods", name: "Airpods", price: 199, image: "https://neal.fun/spend/images/airpods.jpg" },
  { id: "drone", name: "Drone", price: 350, image: "https://neal.fun/spend/images/drone.jpg" },
  { id: "bike", name: "Bike", price: 800, image: "https://neal.fun/spend/images/bike.jpg" },
  { id: "horse", name: "Horse", price: 2500, image: "https://neal.fun/spend/images/horse.jpg" },
  { id: "f1-car", name: "Formula 1 Car", price: 15_000_000, image: "https://neal.fun/spend/images/formula-1-car.jpg" },
  { id: "skyscraper", name: "Skyscraper", price: 850_000_000, image: "https://neal.fun/spend/images/skyscraper.jpg" },
  { id: "cruise-ship", name: "Cruise Ship", price: 930_000_000, image: "https://neal.fun/spend/images/cruise-ship.jpg" },
  { id: "nba-team", name: "NBA Team", price: 2_120_000_000, image: "https://neal.fun/spend/images/nba-team.jpg" },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function App() {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [cart, setCart] = useState<Record<string, number>>({});

  const getQty = (id: string) => cart[id] ?? 0;

  const setQtySafely = (product: Product, nextQty: number) => {
    // input temizliği
    if (!Number.isFinite(nextQty) || Number.isNaN(nextQty)) return;
    if (nextQty < 0) nextQty = 0;

    const currentQty = getQty(product.id);
    if (nextQty === currentQty) return;

    const diff = nextQty - currentQty;
    const deltaMoney = diff * product.price;

    // BUY tarafı: bakiyeyi aşamaz
    if (diff > 0 && balance < deltaMoney) return;

    // Uygula
    setBalance((b) => b - deltaMoney);
    setCart((c) => ({ ...c, [product.id]: nextQty }));
  };

  const handleBuyOne = (product: Product) => {
    const qty = getQty(product.id);
    setQtySafely(product, qty + 1);
  };

  const handleSellOne = (product: Product) => {
    const qty = getQty(product.id);
    setQtySafely(product, qty - 1);
  };

  const receiptItems = useMemo(() => {
    return PRODUCTS
      .map((p) => ({ product: p, qty: getQty(p.id) }))
      .filter((x) => x.qty > 0)
      .map((x) => ({
        ...x,
        total: x.qty * x.product.price,
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  const totalSpent = INITIAL_BALANCE - balance;

  return (
    <div className="page">
      {/* Sticky balance */}
      <div className="balanceBar">
        <div className="balanceValue">{formatMoney(balance)}</div>
      </div>

      {/* Products */}
      <div className="productsWrap">
        <div className="productsGrid">
          {PRODUCTS.map((product) => {
            const qty = getQty(product.id);

            const canSell = qty > 0;
            const canBuy = balance >= product.price;

            return (
              <div className="productCard" key={product.id}>
                <div className="imgWrap">
                  <img src={product.image} alt={product.name} loading="lazy" />
                </div>

                <div className="pName">{product.name}</div>
                <div className="pPrice">{formatMoney(product.price)}</div>

                <div className="controls">
                  <button
                    className="btn btnSell"
                    disabled={!canSell}
                    onClick={() => handleSellOne(product)}
                  >
                    Sell
                  </button>

                  <input
                    className="qtyInput"
                    type="number"
                    min={0}
                    step={1}
                    value={qty}
                    onChange={(e) => setQtySafely(product, Number(e.target.value))}
                  />

                  <button
                    className="btn btnBuy"
                    disabled={!canBuy}
                    onClick={() => handleBuyOne(product)}
                  >
                    Buy
                  </button>
                </div>

                {/* Küçük kural hatırlatmaları */}
                <div className="miniInfo">
                  {!canBuy && <span className="warn">Not enough money</span>}
                  {qty > 0 && (
                    <span className="ok">
                      Item total: <b>{formatMoney(qty * product.price)}</b>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Receipt */}
      <div className="receiptWrap">
        <div className="receiptCard">
          <h2 className="receiptTitle">Your Receipt</h2>

          {receiptItems.length === 0 ? (
            <div className="emptyReceipt">No items yet.</div>
          ) : (
            <>
              <div className="receiptList">
                {receiptItems.map((item) => (
                  <div className="receiptRow" key={item.product.id}>
                    <div className="receiptLeft">
                      <span className="receiptName">{item.product.name}</span>
                      <span className="receiptQty">x{item.qty}</span>
                    </div>
                    <div className="receiptRight">{formatMoney(item.total)}</div>
                  </div>
                ))}
              </div>

              <div className="receiptDivider" />

              <div className="receiptTotalRow">
                <div className="receiptTotalLabel">TOTAL</div>
                <div className="receiptTotalValue">{formatMoney(totalSpent)}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}