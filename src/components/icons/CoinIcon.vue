<script setup lang="ts">
defineProps<{
  code: string;
  size?: string | number;
}>();
</script>

<template>
  <!--
    Custom SVG icons for Iranian gold coins.
    All use a 16×16 viewBox and render inline like an emoji.
      azadi1   – Full Azadi:   gold coin with 8-pointed sunburst
      emami1   – Emami:        gold coin with 6-petal rosette
      azadi1_2 – Half Azadi:   coin half-filled (right half gold)
      azadi1_4 – Quarter Azadi: coin quarter-filled (top-right)
      azadi1g  – Gerami (gram): gold bar / ingot
  -->
  <svg
    :width="size ?? '1em'"
    :height="size ?? '1em'"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style="display: inline-block; vertical-align: -0.125em; flex-shrink: 0"
  >
    <!-- ── Full Azadi: flat 2D hexagon ── -->
    <template v-if="code === 'azadi1'">
      <!-- Coin base -->
      <circle cx="8" cy="8" r="7" fill="#F5C518" stroke="#C9982B" stroke-width="1" />
      <!-- Knurled border -->
      <circle cx="8" cy="8" r="6.2" fill="none" stroke="#C97700" stroke-width="0.45" stroke-dasharray="0.75 0.55" opacity="0.55" />
      <!-- Flat hexagon fill -->
      <polygon points="8,3.2 12.16,5.6 12.16,10.4 8,12.8 3.84,10.4 3.84,5.6" fill="#DCA020" opacity="0.75" />
      <!-- Hexagon outline -->
      <polygon points="8,3.2 12.16,5.6 12.16,10.4 8,12.8 3.84,10.4 3.84,5.6" fill="none" stroke="#C97700" stroke-width="0.9" />
    </template>

    <!-- ── Emami: 6-petal rosette ────────────────────────────── -->
    <template v-else-if="code === 'emami1'">
      <circle cx="8" cy="8" r="7" fill="#F5C518" stroke="#C9982B" stroke-width="1" />
      <circle cx="8" cy="8" r="5.8" fill="none" stroke="#C9982B" stroke-width="0.4" opacity="0.5" />
      <g fill="#C97700" opacity="0.82">
        <ellipse cx="8" cy="5.8" rx="1.2" ry="2.2" />
        <ellipse cx="8" cy="5.8" rx="1.2" ry="2.2" transform="rotate(60 8 8)" />
        <ellipse cx="8" cy="5.8" rx="1.2" ry="2.2" transform="rotate(120 8 8)" />
        <ellipse cx="8" cy="5.8" rx="1.2" ry="2.2" transform="rotate(180 8 8)" />
        <ellipse cx="8" cy="5.8" rx="1.2" ry="2.2" transform="rotate(240 8 8)" />
        <ellipse cx="8" cy="5.8" rx="1.2" ry="2.2" transform="rotate(300 8 8)" />
      </g>
      <circle cx="8" cy="8" r="1.6" fill="#F5C518" stroke="#C97700" stroke-width="0.5" />
    </template>

    <!-- ── Half Azadi: right half filled ───────────────────────
         Arc: from top (8,1) clockwise to bottom (8,15) = right semicircle -->
    <template v-else-if="code === 'azadi1_2'">
      <circle cx="8" cy="8" r="7" fill="rgba(245,197,24,0.18)" stroke="#C9982B" stroke-width="1" />
      <path d="M 8,1 A 7,7 0 0 1 8,15 Z" fill="#F5C518" />
      <circle cx="8" cy="8" r="7" fill="none" stroke="#C9982B" stroke-width="1" />
      <line x1="8" y1="1" x2="8" y2="15" stroke="#C9982B" stroke-width="0.8" />
    </template>

    <!-- ── Quarter Azadi: top-right quarter filled ─────────────
         Arc: from right (15,8) counter-clockwise to top (8,1) = top-right quarter -->
    <template v-else-if="code === 'azadi1_4'">
      <circle cx="8" cy="8" r="7" fill="rgba(245,197,24,0.18)" stroke="#C9982B" stroke-width="1" />
      <path d="M 8,8 L 15,8 A 7,7 0 0 0 8,1 Z" fill="#F5C518" />
      <circle cx="8" cy="8" r="7" fill="none" stroke="#C9982B" stroke-width="1" />
      <!-- top edge only: center → top -->
      <line x1="8" y1="8" x2="8" y2="1" stroke="#C9982B" stroke-width="0.8" />
      <!-- right edge only: center → right -->
      <line x1="8" y1="8" x2="15" y2="8" stroke="#C9982B" stroke-width="0.8" />
    </template>

    <!-- ── Gerami: gold bar / ingot ─────────────────────────── -->
    <template v-else-if="code === 'azadi1g'">
      <rect x="1.5" y="4.5" width="13" height="7" rx="1.5" fill="#F5C518" stroke="#C9982B" stroke-width="1" />
      <rect x="3.5" y="6" width="9" height="4" rx="0.6" fill="none" stroke="#C9982B" stroke-width="0.5" opacity="0.55" />
      <!-- Horizontal grain lines suggesting a metal bar -->
      <line x1="4.5" y1="7.3" x2="11.5" y2="7.3" stroke="#C97700" stroke-width="0.5" opacity="0.6" />
      <line x1="4.5" y1="8.7" x2="11.5" y2="8.7" stroke="#C97700" stroke-width="0.5" opacity="0.6" />
    </template>
  </svg>
</template>
