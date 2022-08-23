export default function BadgeColor(mbti) {
  const palette = {
    ISTJ: "#1f55de",
    ISFJ: "#7DCE13",
    ISTP: "#a7a7a7",
    ISFP: "#FFB4B4",
    INTJ: "#3AB4F2",
    INFJ: "#b2a4ff",
    INTP: "#009DAE",
    INFP: "#9900F0",
    ESTJ: "#935f2f",
    ESFJ: "#FFD124",
    ESTP: "#1F4690",
    ESFP: "#F637EC",
    ENTJ: "#F32424",
    ENFJ: "#FF5F00",
    ENTP: "#545f5f",
    ENFP: "#019267",
  };

  let color;
  Object.entries(palette).map(([key, value]) => {
    if (mbti === key) color = value;
  });
  return color;
}
