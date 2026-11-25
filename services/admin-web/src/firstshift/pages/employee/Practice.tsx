import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { PackageArt } from "../../components/art";
import { ShelfScene } from "../../components/ShelfScene";
import { Dialog, Icon, useDocumentTitle } from "../../components/ui";
import { scenarioV1, scenarioV2 } from "../../fixtures/demo";
import { useDemoStore } from "../../store/demoStore";
import type { Hint, Outcome } from "../../types";

const STEP_INDEX: Record<string, number> = {
  "choose-item": 1,
  "choose-shelf": 2,
  "confirm-placement": 3,
  review: 4,
};

export default function Practice() {
  useDocumentTitle("练习 · 整理货架");
  const { taskId } = useParams();
  const navigate = useNavigate();
  const practice = useDemoStore((state) => state.practice);
  const dispatch = useDemoStore((state) => state.dispatchPractice);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  if (taskId !== "demo-stock") {
    return <Navigate to="/firstshift/practice" replace />;
  }
  if (!practice) {
    return <Navigate to="/firstshift/practice" replace />;
  }

  const scenario = practice.scenarioVersion === "v2" ? scenarioV2 : scenarioV1;
  const session = practice.session;
  const selectedItem = scenario.items.find((item) => item.id === session.selected);
  const targetShelf = scenario.shelves.find((shelf) => shelf.id === session.target);
  const step = STEP_INDEX[session.view] ?? 1;

  function finish(outcome: Outcome) {
    dispatch({ type: "end", outcome });
    navigate("/firstshift/practice/demo-stock/feedback");
  }

  function pauseAndOpen() {
    dispatch({ type: "pause" });
    setPauseOpen(true);
  }

  function closePause() {
    dispatch({ type: "resume" });
    setPauseOpen(false);
  }

  function hintButton(hint: Hint) {
    dispatch({ type: "hint", hint });
  }

  const instruction =
    session.view === "choose-item"
      ? {
          title: "选择商品",
          body: "看看包装上的名称，确认是哪一件。",
        }
      : session.view === "choose-shelf"
        ? {
            title: "查找货架",
            body: "看一看商品名称，再点名称相同的货架标签。放错了不会丢进度，可以再看提示。",
          }
        : session.view === "confirm-placement"
          ? {
              title: "确认放置位置",
              body: `确认后，${selectedItem?.name ?? "商品"}会从备货台移到 ${
                session.target ?? ""
              }（${targetShelf?.name ?? "空位"}）。`,
            }
          : {
              title: "核对放置位置",
              body: "看看两件商品是否都在对应货架。你可以完成、说自己还需要帮助，或暂时结束。",
            };

  return (
    <div className="fs-stack fs-stack--tight">
      <div className="fs-practice__top">
        <div>
          <Link to="/firstshift/practice" className="fs-backlink">
            <Icon name="back" size={20} />
            返回准备页
          </Link>
          <h1 className="fs-h2" id="fs-practice-title" tabIndex={-1} style={{ fontSize: "1.5rem" }}>
            整理货架
          </h1>
        </div>
        <div className="fs-actions">
          <Link className="fs-btn fs-btn--secondary" to="/firstshift/help/request?barrier=mismatch">
            <Icon name="help" size={20} />
            请求帮助
          </Link>
          <button type="button" className="fs-btn fs-btn--secondary" onClick={pauseAndOpen}>
            <Icon name="pause" size={20} />
            暂停
          </button>
          <button type="button" className="fs-btn fs-btn--ghost" onClick={() => setExitOpen(true)}>
            退出
          </button>
        </div>
      </div>

      <div className="fs-stepdots" role="img" aria-label={`第 ${step} 步，共 4 步`}>
        {[1, 2, 3, 4].map((index) => (
          <i key={index} data-active={index === step} data-done={index < step} />
        ))}
      </div>

      <div className="fs-practice">
        <ShelfScene
          scenario={scenario}
          session={session}
          onChooseItem={(id) => dispatch({ type: "choose-item", id })}
          onChooseShelf={(id) => dispatch({ type: "choose-shelf", id })}
        />

        <div className="fs-practice__side">
          <section className="fs-card" aria-labelledby="fs-instruction-title">
            <h2 className="fs-h2" id="fs-instruction-title" style={{ fontSize: "1.5rem" }}>
              {instruction.title}
            </h2>
            <p className="fs-body" style={{ marginTop: 8, fontSize: "1.0625rem" }}>
              {instruction.body}
            </p>

            {selectedItem && session.view === "confirm-placement" && (
              <div className="fs-selected" style={{ marginTop: 14 }}>
                <PackageArt
                  kind={selectedItem.id.startsWith("oats") ? "oats" : "rice"}
                  className="fs-package"
                />
                <span>
                  手中的商品：<strong>{selectedItem.name}</strong>
                  <span className="fs-help" style={{ display: "block" }}>
                    放好之后会从备货台移走
                  </span>
                </span>
              </div>
            )}

            <p className="fs-message" aria-live="polite" style={{ marginTop: 14 }}>
              {session.message}
            </p>

            <div className="fs-actions" style={{ marginTop: 16 }}>
              {session.view === "choose-shelf" && (
                <>
                  <button type="button" className="fs-btn fs-btn--secondary" onClick={() => dispatch({ type: "back" })}>
                    上一步
                  </button>
                  {session.history.length > 0 && (
                    <button type="button" className="fs-btn fs-btn--ghost" onClick={() => dispatch({ type: "undo" })}>
                      <Icon name="undo" size={20} />
                      撤销最近放置
                    </button>
                  )}
                </>
              )}
              {session.view === "confirm-placement" && (
                <>
                  <button type="button" className="fs-btn fs-btn--primary" onClick={() => dispatch({ type: "place" })}>
                    放到这里
                  </button>
                  <button type="button" className="fs-btn fs-btn--secondary" onClick={() => dispatch({ type: "back" })}>
                    重新选货架
                  </button>
                </>
              )}
              {session.view === "review" && (
                <>
                  <button type="button" className="fs-btn fs-btn--primary" onClick={() => finish("confirmed")}>
                    我完成了
                  </button>
                  <button type="button" className="fs-btn fs-btn--secondary" onClick={() => finish("unsure")}>
                    我不确定
                  </button>
                  <button type="button" className="fs-btn fs-btn--secondary" onClick={() => finish("needs-help")}>
                    我还需要帮助
                  </button>
                  {session.history.length > 0 && (
                    <button type="button" className="fs-btn fs-btn--ghost" onClick={() => dispatch({ type: "undo" })}>
                      <Icon name="undo" size={20} />
                      撤销最近放置
                    </button>
                  )}
                </>
              )}
            </div>
          </section>

          <section className="fs-card" aria-labelledby="fs-hints-title">
            <h2 className="fs-h3" id="fs-hints-title">
              提示与帮助
            </h2>
            <div className="fs-hints" style={{ marginTop: 12 }}>
              <button
                type="button"
                className="fs-hintbtn"
                aria-expanded={session.hints.includes("work-order")}
                onClick={() => hintButton("work-order")}
              >
                <Icon name="doc" size={20} />
                查看工作单
              </button>
              {session.hints.includes("work-order") && (
                <div className="fs-hintpanel">
                  <strong>工作单</strong>
                  <ol className="fs-worksheet">
                    {scenario.worksheet.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ol>
                </div>
              )}

              <button
                type="button"
                className="fs-hintbtn"
                aria-expanded={session.hints.includes("photo")}
                onClick={() => hintButton("photo")}
              >
                <Icon name="photo" size={20} />
                图片提示
              </button>
              {session.hints.includes("photo") && (
                <div className="fs-hintpanel">
                  <strong>图片提示</strong>
                  <p style={{ marginTop: 4 }}>
                    这里用商品包装示意和货架文字标签帮助确认位置。
                  </p>
                  <div className="fs-row" style={{ marginTop: 8 }}>
                    <PackageArt kind="oats" className="fs-package" />
                    <span className="fs-help">示例包装 · 名称以页面文字为准</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="fs-hintbtn"
                aria-expanded={session.hints.includes("example")}
                onClick={() => hintButton("example")}
              >
                <Icon name="example" size={20} />
                看示范
              </button>
              {session.hints.includes("example") && (
                <div className="fs-hintpanel">
                  <strong>示范</strong>
                  <p style={{ marginTop: 4 }}>
                    {selectedItem
                      ? `示范：${selectedItem.name}对应的货架是 ${selectedItem.target}。照着做一次，不会扣分。`
                      : "示范：先在备货台选一件商品，再找名称相同的货架标签。"}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <Dialog open={pauseOpen} title="练习已暂停" onClose={closePause}>
        <p className="fs-body">
          进度保存在这台设备上，可以稍后从首页继续。没有时间限制，也不会因为暂停而扣分。
        </p>
        <div className="fs-dialog__actions">
          <button type="button" className="fs-btn fs-btn--ghost" onClick={() => {
            dispatch({ type: "end", outcome: "stopped" });
            navigate("/firstshift/practice/demo-stock/feedback");
          }}>
            结束并查看结果
          </button>
          <button type="button" className="fs-btn fs-btn--secondary" onClick={() => {
            dispatch({ type: "exit" });
            navigate("/firstshift");
          }}>
            退出回首页
          </button>
          <button type="button" className="fs-btn fs-btn--primary" data-autofocus onClick={closePause}>
            继续练习
          </button>
        </div>
      </Dialog>

      <Dialog open={exitOpen} title="退出当前练习？" onClose={() => setExitOpen(false)}>
        <p className="fs-body">
          已经放好的商品和用过的提示会保存在这台设备上。需要时可以从首页「继续上次」恢复。
        </p>
        <div className="fs-dialog__actions">
          <button type="button" className="fs-btn fs-btn--secondary" onClick={() => setExitOpen(false)}>
            继续练习
          </button>
          <button type="button" className="fs-btn fs-btn--danger" onClick={() => {
            dispatch({ type: "exit" });
            navigate("/firstshift");
          }}>
            退出，保留进度
          </button>
        </div>
      </Dialog>
    </div>
  );
}
