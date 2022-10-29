import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';

const perPage = 100;

export default function Ranking() {
  const [orderKey, setOrderKey] = React.useState('rating');
  const [orderDir, setOrderDir] = React.useState<'asc' | 'desc'>('desc');
  const qRanking = useInfiniteQuery(
    ['ranking', orderKey, orderDir],
    ({ pageParam = 0 }) =>
      fetch(
        `/api/ranking?skip=${pageParam}&take=${perPage}&order_key=${orderKey}&order_dir=${orderDir}`
      ).then((res) => res.json()),
    {
      getNextPageParam: (lastPage, pages) =>
        lastPage.length === perPage ? pages.length * perPage : undefined,
    }
  );

  return (
    <main className="container">
      <nav>
        <ul>
          <li>
            <Link href="/">home</Link>
          </li>
          <li>
            <Link href="/ranking">ranking</Link>
          </li>
        </ul>
      </nav>

      <hgroup>
        <h1>imgrank</h1>
        <h2>ranking</h2>
      </hgroup>

      <form>
        <div className="grid">
          <label>
            order by
            <select
              value={orderKey}
              onChange={(e) => setOrderKey(e.target.value)}
            >
              <option value="rating">rating</option>
              <option value="votes">votes</option>
            </select>
          </label>
          <label>
            direction
            <select
              value={orderDir}
              onChange={(e) => setOrderDir(e.target.value as 'asc' | 'desc')}
            >
              <option value="asc">ascending</option>
              <option value="desc">descending</option>
            </select>
          </label>
        </div>
      </form>

      {qRanking.isLoading ? (
        <p>loading...</p>
      ) : (
        <table>
          <tr>
            <th>rank</th>
            <th>filename</th>
            <th>rating</th>
            <th>votes</th>
            <th>image</th>
          </tr>
          {qRanking.data?.pages.map((page, i) =>
            page.map((image: any, j: number) => (
              <tr key={image.filename}>
                <td>{i * perPage + j + 1}</td>
                <td>{image.filename}</td>
                <td>{image.rating.toFixed(2)}</td>
                <td>{image.votes}</td>
                <td>
                  <a
                    href={`/images/${image.filename}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Image
                      src={`/images/${image.filename}`}
                      width={128}
                      height={128}
                      style={{ objectFit: 'contain', background: '#000' }}
                      alt="image"
                    />
                  </a>
                </td>
              </tr>
            ))
          )}
        </table>
      )}
      <button onClick={() => qRanking.fetchNextPage()}>load more</button>
    </main>
  );
}
