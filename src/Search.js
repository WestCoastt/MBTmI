import Algoliasearch from "algoliasearch";
import React, { useEffect, useState } from "react";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import { Form, FormControl, Button, Container } from "react-bootstrap";
import { db } from "./index";
import CreateList from "./CreateList";
import ReactLoading from "react-loading";
import { BsPencilSquare } from "react-icons/bs";

function Search(props) {
  const history = useHistory();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [result, setResult] = useState([]);
  const [noResult, setNoResult] = useState();
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState();
  const [target, setTarget] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const client = Algoliasearch(
    process.env.REACT_APP_ALGOLIA_APP_ID,
    process.env.REACT_APP_ALGOLIA_SEARCH_KEY
  );

  const index = client.initIndex("posts_content");

  const findData = async () => {
    try {
      index.search(search, { hitsPerPage: 10 }).then(({ nbPages }) => {
        setPages(nbPages);
      });

      const response = await index.search(search, {
        hitsPerPage: 10,
        page: 0,
      });

      const resultArr = response.hits.map((a) => a.objectID);

      if (resultArr.length == 0) {
        setNoResult(true);
      } else {
        setNoResult(false);
        db.collection("post")
          .where("docId", "in", resultArr)
          .onSnapshot((snapshot) => {
            const searchArr = snapshot.docs.map((doc) => ({
              data: doc.data(),
            }));
            setResult(searchArr);
          });
        // setPage(page + 1);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onIntersect = async ([entry], observer) => {
    if (entry.isIntersecting) {
      setIsLoading(true);
      const response = await index.search(search, {
        hitsPerPage: 10,
        page: page,
      });
      setPage(page + 1);

      const resultArr = response.hits.map((a) => a.objectID);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await db;
      db.collection("post")
        .where("docId", "in", resultArr)
        .onSnapshot((snapshot) => {
          const nextArr = snapshot.docs.map((doc) => ({
            data: doc.data(),
          }));
          setResult([...result, ...nextArr]);
        });
      setIsLoading(false);
      observer.unobserve(entry.target);
    }
  };

  useEffect(() => {
    let observer;
    observer = new IntersectionObserver(onIntersect, {
      threshold: 0.7,
      rootMargin: "10px 0px",
    });
    if (target && page != pages && pages > 1 && result.length >= 1) {
      observer.observe(target);
    }
    return () => observer && observer.disconnect();
  }, [target, result, pages]);

  const enterPress = (e) => {
    if (e.key == "Enter") {
      if (search.length >= 1) {
        e.preventDefault();
        setNoResult(false);
        setPage(1);
        history.push("/search?q=" + search);
        setResult([]);

        findData();
      } else {
        e.preventDefault();
        window.alert("검색어를 입력하세요.");
      }
    }
  };

  return (
    <>
      <Form
        style={{
          width: "100%",
          maxWidth: "768px",
        }}
      >
        <FormControl
          style={{ fontSize: "16px" }}
          type="search"
          placeholder="검색어를 입력해주세요"
          className="py-2"
          aria-label="Search"
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={enterPress}
        ></FormControl>
      </Form>

      {noResult ? (
        <Container className="mt-3">
          "{location.search.substring(3)}" 에 해당하는 검색결과가 없습니다.
        </Container>
      ) : (
        result.map((a, i) => (
          <CreateList
            key={a.data.docId}
            title={a.data.title}
            content={a.data.content}
            uid={a.data.uid}
            docId={a.data.docId}
            likes={a.data.likes}
            likedUser={a.data.likedUser}
            nickname={a.data.nickname}
            timestamp={a.data.timeStamp.seconds}
            mbti={a.data.mbti}
          ></CreateList>
        ))
      )}

      {isLoading && (
        <div
          style={{
            width: "100%",
            height: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ReactLoading type="spin" color="#0d6efd" width="36px"></ReactLoading>
        </div>
      )}
      <div ref={setTarget}></div>

      {props.create && (
        <Button
          variant="primary"
          size="sm"
          className="rounded-circle"
          style={{
            bottom: "15px",
            marginRight: "15px",
            width: "50px",
            height: "50px",
            position: "fixed",
            zIndex: "10",
            lineHeight: "18px",
          }}
          onClick={() => {
            history.push("/post");
          }}
        >
          <BsPencilSquare size="20"></BsPencilSquare>
        </Button>
      )}
    </>
  );
}

export default Search;
