import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Dropdown } from "react-bootstrap";
import { FaRegComment } from "react-icons/fa";

export default function Best(props) {
  const [transition, setTransition] = useState();

  const bestArr = ["second", "third", "fourth", "fifth", "first"];
  useEffect(() => {
    var index = 0;
    const interval = setInterval(() => {
      if (index === bestArr.length) index = 0;
      setTransition(bestArr[index++]);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Container className="px-0 mt-1 mx-0" style={{ maxWidth: "100%" }}>
      <Dropdown style={{ width: "100%" }}>
        <Container
          className="p-0 ps-2 mx-0 d-flex justify-content-between rounded bg-light"
          style={{
            width: "inherit",
            fontSize: "16px",
            textAlign: "start",
            maxWidth: "768px",
          }}
        >
          <span className="best-badge">인기</span>
          <div style={{ width: "100%", overflow: "hidden" }}>
            <Container className={"head-container px-0 " + transition}>
              {props.best.map((a, i) => (
                <div
                  key={a.data.docId}
                  className="d-flex justify-content-between"
                >
                  <p className="best-number">{i + 1}</p>
                  <Link
                    to={`/comments?docId=${a.data.docId}`}
                    className="best-head"
                  >
                    {a.data.title}
                  </Link>
                </div>
              ))}
            </Container>
          </div>

          <Dropdown.Toggle
            variant="light"
            id="dropdown-split-basic"
            className="py-2 px-3"
            size="sm"
          />
        </Container>

        <Dropdown.Menu
          className="py-0"
          style={{ width: "inherit", fontSize: "14px" }}
          align="end"
        >
          {props.best.map((a, i) => (
            <Dropdown.Item
              key={a.data.docId}
              as={Link}
              to={`/comments?docId=${a.data.docId}`}
              className="best px-3 py-2 d-flex justify-content-between align-items-start"
              style={{
                borderBottom: "1px solid rgba(0,0,0,.125)",
                height: "44px",
              }}
            >
              <p style={{ color: "#ff6c85", fontWeight: "700" }}>{i + 1}</p>
              <p
                className="mx-2"
                style={{
                  width: "100%",
                  margin: "0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {a.data.title}
              </p>
              <span
                style={{ margin: "0", lineHeight: "24px", color: "#6c757d" }}
              >
                <FaRegComment
                  size="14"
                  style={{ margin: "0 0 4px 2px" }}
                ></FaRegComment>
                <span className="comment-badge">{a.data.comments}</span>
              </span>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </Container>
  );
}
