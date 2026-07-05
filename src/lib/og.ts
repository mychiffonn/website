import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

import satori from "satori"
import sharp from "sharp"

import { SITE } from "@site-config"

type RenderPostImageOptions = {
  title: string
  description?: string
}

type SatoriNode = {
  type: string
  props: {
    style?: Record<string, unknown>
    children?: SatoriChild
  }
}

type SatoriChild = SatoriNode | SatoriNode[] | string | null | undefined

const width = 1200
const height = 630
const domain = new URL(SITE.href).hostname.replace(/^www\./, "")

function readFont(relativePath: string, sourcePath: string): Buffer {
  const modulePath = fileURLToPath(new URL(relativePath, import.meta.url))
  return readFileSync(
    existsSync(modulePath) ? modulePath : resolve(process.cwd(), sourcePath),
  )
}

const regularFont = readFont(
  "../assets/og/DMSans-Regular.ttf",
  "src/assets/og/DMSans-Regular.ttf",
)
const boldFont = readFont(
  "../assets/og/DMSans-Bold.ttf",
  "src/assets/og/DMSans-Bold.ttf",
)

export async function renderPostImage({
  title,
  description,
}: RenderPostImageOptions): Promise<Buffer> {
  const titleFontSize = title.length <= 60 ? 64 : 52
  const middleChildren: SatoriNode[] = [
    {
      type: "div",
      props: {
        style: {
          width: 96,
          height: 6,
          marginBottom: 28,
          borderRadius: 3,
          background: "#6FBF5A",
        },
      },
    },
    {
      type: "div",
      props: {
        style: {
          maxHeight: titleFontSize * 1.15 * 3,
          overflow: "hidden",
          color: "#565B78",
          fontSize: titleFontSize,
          fontWeight: 700,
          lineHeight: 1.15,
          lineClamp: 3,
        },
        children: title,
      },
    },
  ]

  if (description) {
    middleChildren.push({
      type: "div",
      props: {
        style: {
          maxHeight: 30 * 1.4 * 2,
          marginTop: 24,
          overflow: "hidden",
          color: "#7A7E96",
          fontSize: 30,
          fontWeight: 400,
          lineHeight: 1.4,
          lineClamp: 2,
        },
        children: description,
      },
    })
  }

  const image: SatoriNode = {
    type: "div",
    props: {
      style: {
        width,
        height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#F1F2F6",
        fontFamily: "DM Sans",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              color: "#7A7E96",
              fontSize: 28,
              fontWeight: 400,
            },
            children: SITE.title,
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
            },
            children: middleChildren,
          },
        },
        {
          type: "div",
          props: {
            style: {
              color: "#7A7E96",
              fontSize: 26,
              fontWeight: 400,
            },
            children: domain,
          },
        },
      ],
    },
  }

  const svg = await satori(image as never, {
    width,
    height,
    fonts: [
      {
        name: "DM Sans",
        data: regularFont,
        weight: 400,
        style: "normal",
      },
      {
        name: "DM Sans",
        data: boldFont,
        weight: 700,
        style: "normal",
      },
    ],
  })

  return sharp(Buffer.from(svg)).png().toBuffer()
}
