import React, { useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  useEffect(() => {
    // Initialize the app when component mounts
    if (typeof window !== 'undefined') {
      import('../public/app').then(() => {
        console.log('Flower Ordering App initialized');
      });
    }
  }, []);

  return (
    <>
      <Head>
        <title>Flower Ordering</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </Head>
      <div id="app-root" />
    </>
  );
}
