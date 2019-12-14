import React, { useState } from "react";
import styled from "styled-components";
import { History, LocationState } from "history";

import Header from "../components/header";
import Card from "../components/card";
import TextInput from "../components/textInput";
import Button from "../components/button";
import Loader from "../components/loader";
import TemplateImage from "../test.png";
import Topbar from "../components/topbar";

import { searchArtist, getSimilarArtists } from "../api/apUtils";

const TopContainer = styled.div`
  text-align: center;
  position: relative;
  margin: auto;
  padding-top: 1em;
  width: 100%;
`;

const ArtistsContainer = styled.div`
  display: inline-flex;
  width: 100%;
  justify-content: center;
  margin-top: 5%;
  flex-wrap: wrap;
  margin-bottom: 3em;
`;

const TitleContainer = styled.div`
  margin-top: 15%;
  text-align: center;
  width: 100%;
`;

const StyledIcon = styled.svg`
  fill: #e16e6e;
`;

interface AppProps {
  getSimilarArtists: (id: string) => object;
  getArtist: (name: string) => object;
  loading: boolean;
  artists?: object[];
  type: string | undefined;
  history: History<LocationState>;
}

interface ArtistProps {
  name?: string;
  images?: ImageProps[];
  genres?: string[];
  popularity?: number;
  external_urls?: ExternalUrls;
  id?: string;
}

interface ExternalUrls {
  spotify: string;
}

interface ImageProps {
  height: number;
  url: string;
  width: number;
}

const App = (props: AppProps) => {
  const [searchString, setSearchString] = useState("");
  const [artistName, setArtistName] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  console.log(props);

  const getArtistByName = async (name: string) => {
    setArtistName(name);
    setLoading(true);
    const searchResult = await searchArtist(name);
    const state = setStatusMessage(searchResult.items, name, "initial");
    setStatus(state);
    setSearchResult(searchResult.items);
    setLoading(false);
  };

  const findSimilarArtists = async (artist: ArtistProps) => {
    const n = artist.name || "";
    setLoading(true);
    setArtistName(n);
    setSearchString(n);
    const searchResult = await getSimilarArtists(artist.id || "");
    console.log("Searchresult", searchResult);
    const state = setStatusMessage(searchResult, n, "similar");
    setStatus(state);
    setSearchResult(searchResult);
    setLoading(false);
  };

  const setStatusMessage = (results: object[], name: string, type: string) => {
    switch (type) {
      case "initial":
        if (results.length === 0)
          return `found 0 artists or bands with name "${name}`;
        if (results.length > 0)
          return `Found one or multiple bands with name "${name}". Select one.`;
        return "";

      case "similar":
        if (results.length === 0)
          return `No similar bands or artists to "${name}"`;
        if (results.length > 0)
          return `Displaying similar artists & bands to "${name}"`;
        return "";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="App">
        <Topbar>
          <TopContainer>
            <TextInput
              value={searchString}
              onChange={e => setSearchString(e.target.value)}
              placeholder={"Search for artist or band.."}
            />
            <Button
              style={{ marginLeft: "1em" }}
              disabled={searchString.length < 1}
              onClick={() => getArtistByName(searchString)}
            >
              Search
            </Button>
          </TopContainer>
        </Topbar>

        {!loading && artistName && (
          <TitleContainer>
            <>
              {
                <StyledIcon
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </StyledIcon>
              }
              <Header title={status} type={"h1"} color={"#CAE5FF"} />
            </>
          </TitleContainer>
        )}

        <ArtistsContainer>
          {loading && <Loader />}
          {!loading &&
            searchResult.length > 0 &&
            searchResult.map((artist: ArtistProps, index: number) => {
              let imageObj = artist.images!.filter(
                (img: ImageProps) => img.width === 640
              );
              return (
                <Card
                  key={artist.id}
                  title={artist.name}
                  img={imageObj[0] ? imageObj[0].url : TemplateImage}
                  text={artist.genres!.join()}
                  fillrate={artist.popularity}
                  menuItems={[
                    {
                      label: "More information",
                      action: () => props.history.push(`/artist/${artist.id}`)
                    },
                    {
                      label: "Search similar artists",
                      action: () => {
                        setArtistName(artist.name || "");
                        setSearchString(artist.name || "");
                        findSimilarArtists(artist);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }
                  ]}
                />
              );
            })}
        </ArtistsContainer>
      </div>
    </>
  );
};

export default App;
