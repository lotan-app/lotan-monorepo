import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { NAV_LIST_MOBILE } from "@App/config/constants";
import { INavList } from "@App/common/type";
import { disableScroll, enableScroll } from "@App/common/helper";
import Text from "./Text";
import styled, { css } from "styled-components";
import Link from "next/link";
import { useRouter } from "next/router";
import Lodash from "@App/common/services/lodash";
import { useOnClickOutside } from "@App/common/hooks/useOnClickOutside";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectorAccountLogin } from "@App/services/auth/authSelector";

const MobileBottomNav = () => {
  const router = useRouter();
  const containerRef = useRef();
  const [showDrop, setShowDrop] = useState("");
  const account = useSelector(selectorAccountLogin);
  const toggleDrop = (id?: string) => {
    if (id === undefined || (id && showDrop !== id)) {
      disableScroll();
    } else {
      enableScroll();
    }
    setShowDrop(id ? (showDrop === id ? "" : id) : "");
  };
  const defaultSelected = useMemo(() => {
    let path = router.pathname.split("/").slice(1);
    if (path.length === 1 && !path[0]) {
      path = ["/"];
    }
    return path;
  }, [router.pathname]);
  const getSelectedMenu = useCallback(
    (menu: string) => {
      return defaultSelected[0] === menu ? "active" : "";
    },
    [defaultSelected]
  );

  const routing = async (event: any) => {
    let url = event.currentTarget.href;
    event.preventDefault();
    toggleDrop();
    const currentPath = router.pathname;
    const currentQuery = router.query;
    const query = Lodash.omitBy({ ...currentQuery }, Lodash.isEmpty);
    if (url === window.location.origin + currentPath) {
      await router.push(
        {
          pathname: currentPath,
          query: query,
        },
        undefined,
        { shallow: true, scroll: false }
      );
      return;
    }
    setTimeout(async () => {
      await router.push(url);
    }, 200);
  };

  useOnClickOutside(
    containerRef,
    useCallback(() => {
      toggleDrop("");
    }, [])
  );
  const variants = {
    visible: { translateY: 0, opacity: 1 },
    hidden: { translateY: 100, opacity: 0 },
  };
  const backdrop_variants = {
    visible: { opacity: 0.5 },
    hidden: { opacity: 0 },
  };
  return (
    <MobileBottomNavStyle
      $size={NAV_LIST_MOBILE.length}
      ref={containerRef}
      id="mobile_bottom_nav"
    >
      <motion.div
        animate={showDrop.length > 0 ? "visible" : "hidden"}
        variants={backdrop_variants}
        className={`overlay ${showDrop.length > 0 ? "active" : ""}`}
        onClick={() => toggleDrop("")}
      />
      <div className="mbns">
        {NAV_LIST_MOBILE.map((item: INavList, index: number) => {
          if (!item.nested) {
            return (
              <div key={`${item.title}_${index}`} className="mbnsn_item">
                <Link
                  href={item.link}
                  onClick={routing}
                  className={`mbnsni ${getSelectedMenu(item.path)}`}
                >
                  {(item.anim || item.icon) && (
                    <div className="mbnsn_icon">
                      {item.anim ? <img src={item.anim} /> : item.icon}
                    </div>
                  )}
                  <div className="mbnsn_content">
                    <Text size={14} color={"neutral-n7"}>
                      {item.title}
                    </Text>
                  </div>
                </Link>
              </div>
            );
          } else {
            return (
              <div
                key={`${item.title}_${index}`}
                className={`mbnsn_item nested_nav ${
                  showDrop === `${item.title}_${index}` ? "show" : ""
                }`}
              >
                <div
                  className={`mbnsni ${getSelectedMenu(item.path)} ${
                    item.nested.findIndex(
                      (item: INavList) => item.path === defaultSelected[0]
                    ) > -1
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    toggleDrop(`${item.title}_${index}`);
                  }}
                >
                  {(item.anim || item.icon) && (
                    <div className="icon">
                      {item.anim ? <img src={item.anim} /> : item.icon}
                    </div>
                  )}
                  <div className="mbnsn_content">
                    <Text size={14} color={"neutral-n7"}>
                      {item.title}
                    </Text>
                  </div>
                </div>
                <motion.div
                  animate={
                    showDrop === `${item.title}_${index}` ? "visible" : "hidden"
                  }
                  variants={variants}
                  className={`nested_drop ${
                    showDrop === `${item.title}_${index}` ? "active" : ""
                  }`}
                  id={`${item.title}_${index}`}
                >
                  {item.nested.map((nestedItem: INavList, idx) => (
                    <div key={`${nestedItem.title}_${idx}`} className="nested">
                      <Text size={14} color="neutral-n6">
                        {nestedItem.title}
                      </Text>
                      {nestedItem.nested.map((navItem: INavList, navIdx) => {
                        return (
                          <Link
                            key={`${navItem.title}_${navIdx}`}
                            href={navItem.link ?? "/"}
                            onClick={routing}
                            className={`nested_item ${getSelectedMenu(
                              nestedItem.path
                            )}`}
                          >
                            {(navItem.icon || navItem.anim) && (
                              <div className="nested_icon">
                                {navItem.anim ? (
                                  <img src={navItem.anim} />
                                ) : (
                                  navItem.icon
                                )}
                              </div>
                            )}
                            <div className="nested_content">
                              <Text size={14} color={"neutral-n6"}>
                                {navItem.title}
                                {navItem.coming && <span>Coming soon</span>}
                                {navItem.smallText && (
                                  <span> {navItem.smallText}</span>
                                )}
                              </Text>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                  {/* {account && (
                    <div className={"storage"}>
                      <Text color="neutral-n8">Storage</Text>
                      <div className={"content"}>
                        <Text color="neutral-n10">1.206GB used from 256GB</Text>
                        <div className={"range"}>
                          <div className={"percent"} />
                        </div>
                      </div>
                    </div>
                  )} */}
                </motion.div>
              </div>
            );
          }
        })}
      </div>
    </MobileBottomNavStyle>
  );
};
export default MobileBottomNav;
interface TMBNStyle {
  size: number;
}
const MobileBottomNavStyle = memo(styled.div<{
  $size: number;
}>`
  background: var(--body-bg);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3.2rem;
  z-index: 2;
  &.hide_nav {
    display: none;
  }
  .overlay {
    content: "";
    position: fixed;
    width: 100vw;
    height: 100vh;
    width: 100dvw;
    height: 100dvh;
    opacity: 0.5;
    top: 0;
    left: 0;
    background: #000;
    z-index: 0;
    display: none;
    &.active {
      display: block;
    }
  }
  .mbns {
    display: grid;
    align-items: center;
    width: 100%;
    background: var(--body-bg);
    position: relative;
    z-index: 1;
    ${({ $size }) => css`
      grid: 1fr / repeat(${$size}, 1fr);
    `}
    .mbnsn_item {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      height: 3.2rem;
      .mbnsni {
        display: flex;
        align-items: center;
        gap: 0 0.571rem;
        padding: 0;
        &:after {
          display: none;
        }
        &.active {
          .mbnsn_content {
            > div {
              color: var(--neutral-n10);
            }
          }
          svg {
            path {
              fill: var(--primary);
            }
          }
        }
        .icon {
          display: flex;
          align-items: center;
          > * {
            width: 1.286rem;
            height: 1.286rem;
          }
        }
      }
      .mbnsn_content {
      }
      &.show {
        .mbnsni {
          .icon {
            svg {
              path {
                fill: var(--primary);
              }
            }
          }
          .mbnsn_content {
            > div {
              color: var(--neutral-n10) !important;
            }
          }
        }
      }
      .nested_drop {
        position: fixed;
        z-index: 999;
        bottom: calc(0% + 3.25rem);
        left: 0;
        width: 100vw;
        width: 100dvw;
        height: max-content;
        padding: 0.571rem 1.71rem 1.71rem 1.71rem;
        background: var(--body-bg);
        display: none;
        .nested {
          margin-top: 1.14rem;
          border-bottom: 1px solid var(--neutral-n2);
          &:last-child {
            border-bottom: 1px solid transparent;
          }
        }
        .nested_item {
          display: grid;
          grid: 1fr / 1.28571rem 1fr;
          align-items: center;
          gap: 0 0.571rem;
          padding: 0.857rem;
          .nested_icon {
            display: flex;
            align-items: center;
            justify-content: center;
            > * {
              height: 100%;
              width: 100%;
            }
          }
          &.active {
            .nested_content {
              color: var(--primary);
            }
          }
        }
        &.active {
          display: block;
        }
        .storage {
          margin-top: 1.14rem;
          .content {
            margin-top: 0.857rem;
            padding-left: 0.857rem;
            .range {
              height: 6px;
              width: 100%;
              position: relative;
              border-radius: 2px;
              background: var(--neutral-n2);
              margin-top: 0.571rem;
              .percent {
                position: absolute;
                height: 100%;
                width: 20%;
                border-radius: 2px;
                background: var(--primary);
              }
            }
          }
        }
      }
      .mbnsn_icon {
        display: flex;
        align-items: center;
        > * {
          width: 1.286rem;
          height: 1.286rem;
        }
      }
    }
  }
`);
