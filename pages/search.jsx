import styles from "../styles/search.module.css"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { useState } from "react"
import Link from "next/link"
import { withIronSessionSsr } from "iron-session/next"
import sessionOptions from "../config/session"

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user
    const props = {}

    if (user) {
      props.user = req.session.user
      props.isLoggedIn = true
    } else {
      props.isLoggedIn = false
    }

    return { props }
  },
  sessionOptions
)

export default function Search(props) {
  const [query, setQuery] = useState("")
  const [newsInfo, setNewsInfo] = useState([])
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearchPerformed(true)
    setLoading(true)

    try {
      const res = await fetch(
        `https://newsdata.io/api/1/latest?apikey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}&q=${query}&language=en&country=us`
      );
      const newsData = await res.json()
      console.log(newsData)

      if (newsData.status === "success") {
        setNewsInfo(newsData.results)
      } else {
        setNewsInfo([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
    setLoading(false)
  }

  return (
    <>
      <main>
        <Header isLoggedIn={props.isLoggedIn} />
        <div className={styles.main}>
          <h1>Discover</h1>
          <p>Explore endless news articles.</p>
          <br />
          <div>
            <form className={styles.searchBarDiv} onSubmit={handleSubmit}>
              <input
                placeholder="Search by keyword"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                name="news-search"
              />
              <br />
              <br />
              <button type="submit">Search</button>
            </form>
          </div>
          <div>
            {!searchPerformed && <br />}
            {searchPerformed && loading && <p>Loading...</p>}
            {searchPerformed && !loading && newsInfo.length === 0 && (
              <p>Oops! No news articles found.</p>
            )}
            <br />
            <br />
            <div className={styles.searchResults}>
              {newsInfo && newsInfo.length > 0 && (
                newsInfo.map((article) => (
                  <div key={article.article_id} className={styles.article}>
                    <Link href={`/news/${article.article_id}`}>
                      <h3 className={styles.title}>{article.title}</h3>
                    </Link>
                    <p>{article.description}</p>
                    <p>Source: {article.source_id}</p>
                    <p>Published: {article.pubDate}</p>
                    <p>Country: {article.country}</p>
                    <p>Language: {article.language}</p>
                    <hr />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  )
}

