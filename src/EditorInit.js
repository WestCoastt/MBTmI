import React from "react";

export default function EditorInit(toolbar, placeholder) {
  return {
    height: 10,
    width: "100%",
    language: "ko_KR",
    placeholder: placeholder,
    menubar: false,
    branding: false,
    statusbar: false,
    contextmenu: false,
    default_link_target: "_blank",
    plugins: ["link", "emoticons", "autoresize", "autolink"],
    toolbar: toolbar ? "| emoticons link |" : false,
    extended_valid_elements: "a[href|target=_blank]",
    autoresize_on_init: false,
    content_style:
      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
  };
}
