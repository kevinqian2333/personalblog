import 'highlight.js/styles/github-dark.css'

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { notFound } from 'next/navigation'

import Navbar from '../../../components/Navbar'
import PageTransition from '../../../components/PageTransition'
import { siteConfig } from '../../../siteConfig'
import FloatingPlayer from '../../../components/FloatingPlayer'

function formatDate(dateString: string) {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  } catch {
    return dateString
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const postsDirectory = path.join(process.cwd(), 'posts')
  const fullPath = path.join(postsDirectory, `${slug}.md`)

  if (!fs.existsSync(fullPath)) {
    notFound()
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const title = data.title || slug
  const date = data.date || ''
  const description = data.description || ''
  const tags: string[] = data.tags || []
  const category = data.category || ''
  const cover = data.cover || siteConfig.defaultPostCover

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content)

  const contentHtml = processedContent.toString()

  const formattedDate = formatDate(date)

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="w-full max-w-4xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 pb-20 relative z-10">
          <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 md:p-10">
            {cover && (
              <img
                src={cover}
                alt={title}
                className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-2xl mb-8"
                loading="lazy"
              />
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              {formattedDate && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {formattedDate}
                </span>
              )}
              {category && (
                <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-medium">
                  {category}
                </span>
              )}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {description && (
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 italic border-l-4 border-indigo-400 pl-4">
                {description}
              </p>
            )}

            <div
              className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        </div>
      </PageTransition>
      <FloatingPlayer />
    </>
  )
}
