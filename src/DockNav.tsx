import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  CSSProperties,
  ReactNode,
} from "react";

export interface DockNavItem {
  id: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface DockNavTheme {
  /** Active button background (default: "linear-gradient(to bottom right, #3b82f6, #1d4ed8)") */
  activeBackground?: string;
  /** Active button text/icon color (default: "white") */
  activeColor?: string;
  /** Inactive button background (default: "linear-gradient(to bottom right, #374151, #1f2937)") */
  inactiveBackground?: string;
  /** Inactive button text/icon color (default: "#d1d5db") */
  inactiveColor?: string;
  /** Active indicator dot color (default: "#60a5fa") */
  indicatorColor?: string;
  /** Tooltip background color (default: "#111827") */
  tooltipBackground?: string;
  /** Tooltip text color (default: "white") */
  tooltipColor?: string;
}

export interface DockNavClassNames {
  /** Class for the nav container */
  nav?: string;
  /** Class for the dock container */
  dock?: string;
  /** Class for each item wrapper */
  item?: string;
  /** Class for buttons */
  button?: string;
  /** Class for active button (added alongside button) */
  buttonActive?: string;
  /** Class for inactive button (added alongside button) */
  buttonInactive?: string;
  /** Class for tooltip */
  tooltip?: string;
  /** Class for active indicator dot */
  indicator?: string;
}

export interface DockNavProps {
  items: DockNavItem[];
  position?: "top" | "bottom";
  style?: CSSProperties;
  onNavigate?: (id: string) => void;
  activeId?: string;
  /** Enable scroll-based active detection via IntersectionObserver */
  observeScroll?: boolean;
  /** Base icon size in pixels (default: 48) */
  baseSize?: number;
  /** Max magnification multiplier (default: 1.4) */
  maxScale?: number;
  /** Gap between items in pixels (default: 12) */
  gap?: number;
  /** Magnification distance in pixels (default: 100) */
  magnifyDistance?: number;
  /** Animation duration in ms (default: 100) */
  animationDuration?: number;
  /** Theme customization (inline styles) */
  theme?: DockNavTheme;
  /** Custom tooltip renderer */
  renderTooltip?: (item: DockNavItem, isVisible: boolean) => ReactNode;
  /** Hide tooltips entirely */
  hideTooltips?: boolean;
  /** Class names for Tailwind/CSS styling (overrides theme when provided) */
  classNames?: DockNavClassNames;
  /** Use only classNames, skip all default inline styles */
  unstyled?: boolean;
}

const defaultTheme: Required<DockNavTheme> = {
  activeBackground: "linear-gradient(to bottom right, #3b82f6, #1d4ed8)",
  activeColor: "white",
  inactiveBackground: "linear-gradient(to bottom right, #374151, #1f2937)",
  inactiveColor: "#d1d5db",
  indicatorColor: "#60a5fa",
  tooltipBackground: "#111827",
  tooltipColor: "white",
};

export const DockNav: React.FC<DockNavProps> = ({
  items,
  position = "top",
  style,
  onNavigate,
  activeId,
  observeScroll = false,
  baseSize = 48,
  maxScale = 1.4,
  gap = 12,
  magnifyDistance = 100,
  animationDuration = 100,
  theme: userTheme,
  renderTooltip,
  hideTooltips = false,
  classNames = {},
  unstyled = false,
}) => {
  const theme = { ...defaultTheme, ...userTheme };

  const [mouseX, setMouseX] = useState<number | null>(null);
  const [isHoveringDock, setIsHoveringDock] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [currentActiveId, setCurrentActiveId] = useState<string>(
    activeId || items[0]?.id || "",
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [buttonRects, setButtonRects] = useState<Map<number, DOMRect>>(
    new Map(),
  );
  const observerRef = useRef<IntersectionObserver | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const setButtonRef = useCallback(
    (index: number) => (el: HTMLButtonElement | null) => {
      if (el) {
        buttonRefs.current.set(index, el);
      } else {
        buttonRefs.current.delete(index);
      }
    },
    [],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!observeScroll) return;

    const options = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCurrentActiveId(entry.target.id);
        }
      });
    }, options);

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [observeScroll, items]);

  useEffect(() => {
    if (activeId) {
      setCurrentActiveId(activeId);
    }
  }, [activeId]);

  useEffect(() => {
    if (isHoveringDock) {
      const rects = new Map<number, DOMRect>();
      buttonRefs.current.forEach((button, index) => {
        rects.set(index, button.getBoundingClientRect());
      });
      setButtonRects(rects);
    }
  }, [isHoveringDock, mouseX]);

  const handleClick = useCallback(
    (id: string) => {
      if (observeScroll) {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
          });
        }
      }
      setCurrentActiveId(id);
      onNavigate?.(id);
    },
    [onNavigate, prefersReducedMotion, observeScroll],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick(id);
      }
    },
    [handleClick],
  );

  const getSize = useCallback(
    (index: number): number => {
      if (prefersReducedMotion) return 1;
      if (!isHoveringDock || mouseX === null) return 1;

      const rect = buttonRects.get(index);
      if (!rect) return 1;

      const buttonCenterX = rect.left + rect.width / 2;
      const distance = Math.abs(mouseX - buttonCenterX);

      if (distance > magnifyDistance) return 1;

      return 1 + (maxScale - 1) * Math.pow(1 - distance / magnifyDistance, 2);
    },
    [
      prefersReducedMotion,
      isHoveringDock,
      mouseX,
      buttonRects,
      maxScale,
      magnifyDistance,
    ],
  );

  const closestIndex = useMemo((): number | null => {
    if (!isHoveringDock || mouseX === null) return null;

    let closest: number | null = null;
    let closestDistance = Infinity;

    buttonRects.forEach((rect, index) => {
      const buttonCenterX = rect.left + rect.width / 2;
      const distance = Math.abs(mouseX - buttonCenterX);

      if (distance < closestDistance && distance < 40) {
        closestDistance = distance;
        closest = index;
      }
    });

    return closest;
  }, [isHoveringDock, mouseX, buttonRects]);

  const showTooltip = (id: string, index: number) => {
    if (hideTooltips) return false;
    const isClosest = closestIndex === index;
    const isFocused = focusedId === id;
    const isActive = currentActiveId === id;
    return (isClosest || isFocused) && !isActive;
  };

  const transitionStyle = prefersReducedMotion
    ? "none"
    : `transform ${animationDuration}ms ease-out`;

  if (items.length === 0) {
    return null;
  }

  const navStyle: CSSProperties = unstyled
    ? style || {}
    : {
        display: "flex",
        justifyContent: "center",
        padding: "12px 0",
        ...(position === "bottom"
          ? {
              position: "fixed",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
            }
          : { position: "sticky", top: 0, zIndex: 50 }),
        ...style,
      };

  const dockStyle: CSSProperties = unstyled
    ? {}
    : {
        display: "flex",
        alignItems: "flex-end",
        gap,
        padding: "12px 16px",
      };

  return (
    <nav
      style={navStyle}
      className={classNames.nav}
      role="navigation"
      aria-label="Main navigation"
    >
      <div
        ref={dockRef}
        style={dockStyle}
        className={classNames.dock}
        onMouseMove={(e) => setMouseX(e.clientX)}
        onMouseEnter={() => setIsHoveringDock(true)}
        onMouseLeave={() => {
          setIsHoveringDock(false);
          setMouseX(null);
        }}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentActiveId === item.id;
          const sizeMultiplier = getSize(index);
          const translateY = (sizeMultiplier - 1) * baseSize * 0.5;
          const isTooltipVisible = showTooltip(item.id, index);

          const buttonStyle: CSSProperties = unstyled
            ? {
                width: baseSize,
                height: baseSize,
                transform: `scale(${sizeMultiplier}) translateY(-${translateY / sizeMultiplier}px)`,
                transition: transitionStyle,
              }
            : {
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                outline: "none",
                background: isActive
                  ? theme.activeBackground
                  : theme.inactiveBackground,
                color: isActive ? theme.activeColor : theme.inactiveColor,
                boxShadow: isActive
                  ? "0 4px 6px -1px rgba(59, 130, 246, 0.3)"
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                width: baseSize,
                height: baseSize,
                transform: `scale(${sizeMultiplier}) translateY(-${translateY / sizeMultiplier}px)`,
                transformOrigin: "bottom center",
                transition: transitionStyle,
              };

          const tooltipOffset = baseSize * sizeMultiplier + 12;
          const tooltipStyle: CSSProperties = unstyled
            ? {
                opacity: isTooltipVisible ? 1 : 0,
                pointerEvents: isTooltipVisible ? "auto" : "none",
              }
            : {
                position: "absolute",
                bottom: baseSize,
                transform: `translateY(-${tooltipOffset - baseSize}px)`,
                padding: "8px 16px",
                backgroundColor: theme.tooltipBackground,
                color: theme.tooltipColor,
                fontSize: 15,
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontWeight: 500,
                borderRadius: 10,
                whiteSpace: "nowrap",
                zIndex: 50,
                opacity: isTooltipVisible ? 1 : 0,
                pointerEvents: isTooltipVisible ? "auto" : "none",
                transition: prefersReducedMotion
                  ? "none"
                  : `opacity 150ms, transform ${animationDuration}ms ease-out`,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              };

          const tooltipArrowStyle: CSSProperties = unstyled
            ? {}
            : {
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: "100%",
                width: 0,
                height: 0,
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: `4px solid ${theme.tooltipBackground}`,
              };

          const itemStyle: CSSProperties = unstyled
            ? {}
            : {
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              };

          const indicatorStyle: CSSProperties = unstyled
            ? {}
            : {
                position: "absolute",
                bottom: -8,
                width: 4,
                height: 4,
                backgroundColor: theme.indicatorColor,
                borderRadius: "50%",
              };

          const buttonClassName = [
            classNames.button,
            isActive ? classNames.buttonActive : classNames.buttonInactive,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div key={item.id} style={itemStyle} className={classNames.item}>
              {renderTooltip ? (
                renderTooltip(item, isTooltipVisible)
              ) : (
                <div
                  role="tooltip"
                  id={`tooltip-${item.id}`}
                  style={tooltipStyle}
                  className={classNames.tooltip}
                >
                  {item.label}
                  {!unstyled && <div style={tooltipArrowStyle} />}
                </div>
              )}

              <button
                ref={setButtonRef(index)}
                type="button"
                onClick={() => handleClick(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                onFocus={() => setFocusedId(item.id)}
                onBlur={() => setFocusedId(null)}
                aria-label={item.label}
                aria-describedby={
                  renderTooltip ? undefined : `tooltip-${item.id}`
                }
                aria-current={isActive ? "page" : undefined}
                style={buttonStyle}
                className={buttonClassName || undefined}
              >
                <Icon
                  style={{
                    width: baseSize,
                    height: baseSize,
                  }}
                />
              </button>

              {isActive && (
                <div style={indicatorStyle} className={classNames.indicator} />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default DockNav;
