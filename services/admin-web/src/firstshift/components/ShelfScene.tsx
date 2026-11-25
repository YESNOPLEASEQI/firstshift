import type { Scenario, Session } from "../types";
import { PackageArt } from "./art";

interface ShelfSceneProps {
  scenario: Scenario;
  session: Session;
  onChooseItem: (id: string) => void;
  onChooseShelf: (id: string) => void;
}

export function ShelfScene({ scenario, session, onChooseItem, onChooseShelf }: ShelfSceneProps) {
  const placedIds = new Set(Object.keys(session.placements));
  const canChooseItem = session.status === "active" && session.view === "choose-item";
  const canChooseShelf = session.status === "active" && session.view === "choose-shelf";

  const rows = [scenario.shelves.slice(0, 2), scenario.shelves.slice(2, 4)];

  return (
    <section className="fs-scene" aria-label="理货模拟场景">
      <div className="fs-scene__label">
        <span>工作现场 · 备货台与货架</span>
        <span className="fs-badge fs-badge--demo">合成场景</span>
      </div>

      <div className="fs-counter">
        <h2 className="fs-counter__title">
          {session.view === "choose-item" ? "备货台（选择一件商品）" : "备货台"}
        </h2>
        <div className="fs-items">
          {scenario.items.map((item) => {
            const placedAt = session.placements[item.id];
            const isPlaced = placedIds.has(item.id);
            const isSelected = session.selected === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className="fs-item"
                aria-pressed={isSelected}
                disabled={isPlaced || !canChooseItem}
                onClick={() => onChooseItem(item.id)}
              >
                <PackageArt kind={item.id.startsWith("oats") ? "oats" : "rice"} className="fs-package" />
                <span>
                  <span className="fs-item__name">{item.name}</span>
                  <span className="fs-item__hint">
                    {isPlaced ? `已放到 ${placedAt}` : item.packageLabel}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {session.view === "choose-shelf" && session.status === "active" && (
          <p className="fs-help" style={{ marginTop: 10 }}>
            现在先完成货架操作；放好的商品会从备货台移走。
          </p>
        )}
      </div>

      <div className="fs-shelf" role="group" aria-label="两层两列货架，上排 A1、A2，下排 B1、B2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex}>
            <div className="fs-shelf__row">
              {row.map((shelf) => {
                const occupying = Object.entries(session.placements).find(
                  ([, shelfId]) => shelfId === shelf.id,
                );
                const occupyingItem = occupying
                  ? scenario.items.find((item) => item.id === occupying[0])
                  : undefined;
                const isTarget = session.target === shelf.id;
                const clickable = canChooseShelf && Boolean(session.selected);

                return (
                  <button
                    key={shelf.id}
                    type="button"
                    className="fs-slot"
                    data-clickable={clickable}
                    aria-pressed={isTarget}
                    disabled={!clickable}
                    aria-label={`货架 ${shelf.id}，标签是${shelf.name}，${
                      occupyingItem ? `已放${occupyingItem.name}` : "目前是空位"
                    }`}
                    onClick={() => onChooseShelf(shelf.id)}
                  >
                    <span className="fs-slot__tag" aria-hidden="true">
                      {shelf.id}
                    </span>
                    {occupyingItem ? (
                      <span className="fs-slot__occupied">
                        <PackageArt
                          kind={occupyingItem.id.startsWith("oats") ? "oats" : "rice"}
                          className="fs-package"
                        />
                        <span className="fs-slot__label">{occupyingItem.name}</span>
                      </span>
                    ) : (
                      <>
                        <span className="fs-slot__label">
                          <span className="fs-slot__label-tag" aria-hidden="true">
                            标签
                          </span>
                          {shelf.name}
                        </span>
                        <span className="fs-slot__empty">空位</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
            {rowIndex === 0 && <div className="fs-shelf__board" aria-hidden="true" />}
          </div>
        ))}
      </div>
      <p className="fs-shelf__caption">
        点货架编号或名称都可以选择位置。
      </p>
    </section>
  );
}
