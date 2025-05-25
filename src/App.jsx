import React, { useState, useEffect } from "react";
import Search from "./components/search.jsx";
import Spinner from "./components/spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import { useDebounce } from "react-use";
import { updateSearchCount, getTrendingMovies } from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
const App = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [movieList, setMovieList] = useState([]);

  const [trendingMovies, setTrendingMovies] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);

    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(
            query
          )}&api_key=${API_KEY}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error(`Error fetching movies`);
      }

      const data = await response.json();

      if (data.response === "False") {
        setErrorMessage(data.error || "Error fetching movies");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage(`Error fetching movies: Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
    }
  };

  useEffect(() => {
    {
      fetchMovies(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <>
      <main>
        <div className="pattern" />
        <div className="wrapper">
          <header>
            <div
              style={{
                display: "inline",
              }}
            >
              <img
                src="./logo.png"
                alt="website-logo"
                style={{
                  marginTop: "0px",
                  marginBottom: "0px",
                  height: "150px",
                  width: "150px",
                }}
              />
              <h1 className="text-gradient">PopcornPilot</h1>
            </div>
            <img src="./hero.png" alt="hero-banner" />
            <h1>
              Find <span className="text-gradient">Movies</span> You'll Enjoy
              Without the Hassle
            </h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          {trendingMovies.length > 0 && (
            <section id="trending" className="trending">
              <h2>Trending Movies</h2>
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section id="all-movies" className="all-movies">
            <h2>All Movies</h2>
            {isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <hr
        style={{
          boxShadow: "0px 0px 500px 20px #AB8BFF"
        }}
      />
      <footer className="w-full bg-gradient-to-t  text-white px-8 py-10 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div className="md:w-2/3">
            <h3 className="text-3xl font-bold mb-4 text-gradient">
              PopcornPilot
            </h3>
            <p className="mb-4 text-red-400 text-lg">
              <span className="mr-2 text-2xl">•</span>
              If you’re experiencing issues, please try again using a VPN
              (excluding India).
            </p>
            <p className="text-gray-300 text-lg">
              Have suggestions or feedback? Contact us at:{" "}
              <a
                href="https://www.popcornpilot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 underline"
              >
                www.popcornpilot.com
              </a>
            </p>
          </div>

          <div className="md:w-1/3">
            <h4 className="text-xl font-semibold mb-3 text-blue-500">
              Quick Links
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#trending" className="hover:text-amber-400">
                  Trending Movies
                </a>
              </li>
              <li>
                <a href="#all-movies" className="hover:text-amber-400">
                  All Movies
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@popcornpilot.com"
                  className="hover:text-amber-400"
                >
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-4 text-center text-gray-500 text-auto">
          © {new Date().getFullYear()} PopcornPilot. All rights reserved.
        </div>
      </footer>
    </>
  );
};

export default App;
