import React from 'react';
import Image from 'next/image';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { VoteRequest } from './api/vote';

type Img = {
  filename: string;
  votes: number;
  rating: number;
};

export default function VoteBatch() {
  const [pairings, setPairings] = React.useState<[Img, Img][]>([]);
  const [currentPairing, setCurrentPairing] = React.useState<number>(0);
  const [votes, setVotes] = React.useState<VoteRequest[]>([]);
  const pair = pairings.length === 0 ? null : pairings[currentPairing];

  const qBatch = useQuery(
    ['batch'],
    () => fetch('/api/getbatch').then((res) => res.json()),
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        // Create pairings
        const _pairings: [Img, Img][] = [];
        for (let i = 0; i < data.length; i++) {
          for (let j = i + 1; j < data.length; j++) {
            _pairings.push([data[i], data[j]]);
          }
        }
        setPairings(
          _pairings
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
        );
        setCurrentPairing(0);
      },
    }
  );

  const mVote = useMutation(
    () =>
      fetch('/api/votebatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(votes),
      }),
    {
      onSuccess: () => {
        qBatch.refetch();
      },
    }
  );

  const vote = (outcome: VoteRequest['outcome']) => {
    if (pair) {
      setVotes((votes) => [
        ...votes,
        { left: pair[0].filename, right: pair[1].filename, outcome },
      ]);
      if (currentPairing < pairings.length - 1) {
        setCurrentPairing(currentPairing + 1);
      } else {
        mVote.mutate();
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      vote('left');
    } else if (e.key === 'ArrowRight') {
      vote('right');
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    vote,
    mVote,
    pair,
    currentPairing,
    setCurrentPairing,
    pairings,
    onKeyDown,
  ]);

  return (
    <main className="container">
      {pairings.length === 0 ? (
        <p>loading...</p>
      ) : mVote.isLoading ? (
        <p>submitting...</p>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          {pair?.map((image, i) => (
            <article
              key={image.filename}
              style={{ cursor: 'pointer' }}
              onClick={() => vote(i === 0 ? 'left' : 'right')}
            >
              <Image
                alt="image"
                src={'/images/' + image.filename}
                width={512}
                height={512}
                style={{
                  objectFit: 'contain',
                  background: '#000',
                }}
              />
              <div style={{ padding: 8 }}>
                <table>
                  <tr>
                    <th style={{ textAlign: 'left', paddingRight: 8 }}>file</th>
                    <td>{image.filename}</td>
                  </tr>
                  <tr>
                    <th style={{ textAlign: 'left', paddingRight: 8 }}>
                      votes
                    </th>
                    <td>{image.votes}</td>
                  </tr>
                  <tr>
                    <th style={{ textAlign: 'left', paddingRight: 8 }}>
                      rating
                    </th>
                    <td>{image.rating.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}

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
        <h2>which one is better?</h2>
      </hgroup>
      <p>click on the image or use the left and right arrow keys to vote</p>
      <p>
        voting in batches, {currentPairing + 1} of {pairings.length}
      </p>

      <div style={{ display: 'none' }}>
        {pairings.length > 0 &&
          pairings.map((pair, i) => (
            <div key={i}>
              <Image
                alt="image"
                src={'/images/' + pair[0].filename}
                width={512}
                height={512}
              />
              <Image
                alt="image"
                src={'/images/' + pair[1].filename}
                width={512}
                height={512}
              />
            </div>
          ))}
      </div>
    </main>
  );
}
