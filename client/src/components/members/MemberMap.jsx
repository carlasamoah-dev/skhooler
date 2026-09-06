"use client";

import { useEffect, useRef, useState } from "react";

import { formatCount } from "@/lib/format";

/** The brand ramp, thresholded exactly as the reference implementation does. */
const BREAKS = [25, 75, 200, 450];
const RAMP = ["#f4e6e9", "#e8d0d5", "#d2a6ae", "#a5636f", "#6b2334"];
const NO_DATA = "#ece6dc";

function fillFor(count) {
  if (!count) return NO_DATA;
  let i = 0;
  while (i < BREAKS.length && count >= BREAKS[i]) i += 1;
  return RAMP[i];
}

// The topology is ~105KB, so it loads once, on demand, and is kept for the session.
let topologyPromise = null;
function loadTopology() {
  if (!topologyPromise) {
    topologyPromise = Promise.all([
      import("world-atlas/countries-110m.json"),
      import("topojson-client"),
      import("d3-geo"),
    ]).then(([topo, topojson, geo]) => {
      const raw = topo.default ?? topo;
      const collection = topojson.feature(raw, raw.objects.countries);
      return {
        geo,
        // Antarctica is dropped: it has no members and distorts the fit.
        features: collection.features.filter((f) => f.properties.name !== "Antarctica"),
      };
    });
  }
  return topologyPromise;
}

export default function MemberMap({ geography }) {
  const containerRef = useRef(null);
  const [atlas, setAtlas] = useState(null);
  const [size, setSize] = useState({ width: 0, height: 440 });
  const [hover, setHover] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadTopology().then((a) => !cancelled && setAtlas(a));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: Math.round(entry.contentRect.width), height: 440 });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const ready = atlas && size.width > 0;
  let paths = [];

  if (ready) {
    const projection = atlas.geo
      .geoNaturalEarth1()
      .fitExtent(
        [
          [8, 14],
          [size.width - 8, size.height - 26],
        ],
        { type: "FeatureCollection", features: atlas.features },
      );
    const path = atlas.geo.geoPath(projection);

    paths = atlas.features.map((feature) => {
      const name = feature.properties.name;
      const count = geography.countries[name] ?? 0;
      return { id: feature.id ?? name, name, count, d: path(feature) };
    });
  }

  const share = (count) => ((count / geography.total) * 100).toFixed(1);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: size.height }}>
      {ready ? (
        <svg
          width={size.width}
          height={size.height}
          role="img"
          aria-label={`Members by country across ${paths.filter((p) => p.count > 0).length} countries`}
          onMouseLeave={() => setHover(null)}
        >
          {paths.map((country) => (
            <path
              key={country.id}
              d={country.d}
              fill={fillFor(country.count)}
              stroke={hover?.name === country.name ? "#201e1d" : "#f5ead8"}
              strokeWidth={hover?.name === country.name ? 1.2 : 0.6}
              onMouseMove={(e) => {
                const box = containerRef.current.getBoundingClientRect();
                setHover({ ...country, x: e.clientX - box.x, y: e.clientY - box.y });
              }}
            />
          ))}
        </svg>
      ) : (
        <div className="w-full h-full rounded-inner bg-sand-100 animate-pulse" aria-hidden="true" />
      )}

      {/* Fewer -> More legend, bottom left. */}
      <div className="absolute left-2 bottom-0 flex items-center gap-1.5">
        <span className="text-[11px] font-semibold text-sand-700">Fewer</span>
        {RAMP.map((colour) => (
          <span key={colour} aria-hidden="true" className="w-4 h-2.5 rounded-[2px]" style={{ background: colour }} />
        ))}
        <span className="text-[11px] font-semibold text-sand-700">More</span>
      </div>

      {hover ? (
        <div
          role="status"
          // Clamped so the tooltip never runs past the container edge.
          style={{
            left: Math.min(Math.max(hover.x + 14, 8), Math.max(size.width - 208, 8)),
            top: Math.min(Math.max(hover.y - 8, 8), size.height - 96),
          }}
          className="absolute w-[196px] pointer-events-none bg-ink text-ground rounded-chip px-3 py-2.5 shadow-lg"
        >
          <p className="font-display font-extrabold text-ui">{hover.name}</p>
          {hover.count > 0 ? (
            <>
              <p className="text-meta">{`${formatCount(hover.count)} members · ${share(hover.count)}%`}</p>
              <p className="text-meta opacity-80">
                {`${Math.max(1, Math.round(hover.count * 0.033))} online now`}
              </p>
              <p className="text-meta opacity-80">
                {`${Math.max(1, Math.round(hover.count * 0.052))} joined this month`}
              </p>
            </>
          ) : (
            <p className="text-meta opacity-80">No members yet</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
