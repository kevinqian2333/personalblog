import { Suspense } from 'react'
import type { PostMeta } from "../../lib/types"
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'

import Navbar from '../../components/Navbar'
import PageTransition from '../../components/PageTransition'
import { siteConfig } from '../../siteConfig'
import FloatingPlayer from '../../components/FloatingPlayer'
import PostsFilter from '../../components/PostsFilter'

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

export default function PostsPage() {
  const postsDirectory = path.join(process.cwd(), 'posts')
  let allPosts: PostMeta[] = []

  try {
    if (fs.existsSync(postsDirectory)) {
      const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith('.md'))
      allPosts = fileNames
        .map((fileName) => {
          const fullPath = path.join(postsDirectory, fileName)
          const { data } = matter(fs.readFileSync(fullPath, 'utf8'))
          const rawDate = data.date || '1970-01-01'
          return {
            slug: fileName.replace(/\.md$/, ''),
            title: data.title || '',
            description: data.description || '',
            cover: data.cover || siteConfig.defaultPostCover,
            tags: data.tags || [],
            category: data.category || '',
            date: rawDate,
            formattedDate: formatDate(rawDate),
          }
        })
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          if (dateB !== dateA) return dateB - dateA
          return b.slug.localeCompare(a.slug)
        })
    }
  } catch (e) {
    console.error("Failed to read posts directory:", e)
  }

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="w-full max-w-6xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 pb-20 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-8">
            博客文章
          </h1>

          <Suspense fallback={<div className="text-center py-20 text-slate-500">加载中...</div>}>
            <PostsFilter posts={allPosts} />
          </Suspense>
        </div>
      </PageTransition>
      <FloatingPlayer />
    </>
  )
}
