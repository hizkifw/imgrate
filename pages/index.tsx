import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { VoteRequest } from "./api/vote";

export default function Home() {
  const qPair = useQuery(
    ["pair"],
    () => fetch("/api/getpair").then((res) => res.json()),
    { refetchOnMount: false, refetchOnWindowFocus: false }
  );
  const mVote = useMutation(
    (outcome: VoteRequest["outcome"]) =>
      fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          left: qPair.data[0].filename,
          right: qPair.data[1].filename,
          outcome,
        }),
      }),
    {
      onSuccess: () => {
        qPair.refetch();
      },
    }
  );

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      mVote.mutate("left");
    } else if (e.key === "ArrowRight") {
      mVote.mutate("right");
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
        <h2>which one is better?</h2>
      </hgroup>
      <p>click on the image or use the left and right arrow keys to vote</p>

      {qPair.isLoading || !Array.isArray(qPair.data) ? (
        <p>loading...</p>
      ) : mVote.isLoading ? (
        <p>submitting...</p>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          {qPair.data?.map((image: any, i: number) => (
            <article
              key={image.filename}
              style={{ cursor: "pointer" }}
              onClick={() => mVote.mutate(i === 0 ? "left" : "right")}
            >
              <img
                src={"/images/" + image.filename}
                width={512}
                height={512}
                style={{
                  objectFit: "contain",
                  background: "#000",
                }}
              />
              <div style={{ padding: 8 }}>
                <table>
                  <tr>
                    <th style={{ textAlign: "left", paddingRight: 8 }}>file</th>
                    <td>{image.filename}</td>
                  </tr>
                  <tr>
                    <th style={{ textAlign: "left", paddingRight: 8 }}>
                      votes
                    </th>
                    <td>{image.votes}</td>
                  </tr>
                  <tr>
                    <th style={{ textAlign: "left", paddingRight: 8 }}>
                      rating
                    </th>
                    <td title={image.rating.toFixed(2)}>hover to see</td>
                  </tr>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
