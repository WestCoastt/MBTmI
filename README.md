# MBTmI
> ### 👪 MBTI에 과몰입 할 수 있고 자유롭게 이야기를 나눌 수 있는 커뮤니티

### 🛠️ 기술스택  

- `React`
- `Firebase`
- `Bootstrap`
- `Algolia`
- `TinyMCE`
---------
### 👌 주요 기능
- #### 유저 관련
    - Firebase Authentication을 활용한 로그인 및 회원가입
    
      <img height="360px" src="https://user-images.githubusercontent.com/98147070/190349769-f666fe23-da52-4a05-b75e-88671c0e6b83.gif">
    
    - 프로필 페이지(프로필 설정 및 수정, 내가 쓴 글 목록 등)
    
      <img height="360px" src="https://user-images.githubusercontent.com/98147070/190349792-73b0caee-a94c-4d1f-8619-50d0ab2699f3.gif">
      
    - 회원탈퇴 기능
- #### 메인페이지
    - 전체 게시글 리스트를 보여주는 페이지
    - 게시글 카드 컴포넌트(좋아요, 댓글, 공유, 닉네임, 타임스탬프, MBTI별 뱃지)
    - 실시간 인기글
      
      <img height="360px" src="https://user-images.githubusercontent.com/98147070/190349774-59c545f9-b966-4f06-a00c-b543bb5bd877.gif">
    
    - 새 게시물 알림
    
      <img height="360px" src="https://user-images.githubusercontent.com/98147070/190349777-4948f47c-0fd8-40e7-b648-b8d59fd086f1.gif">
    
    - 게시물 높이에 따른 게시글 하단 마스킹 처리와 더보기 버튼
- #### 게시글 작성 페이지
    - TinyMCE 텍스트 에디터 사용
    
      <img height="360px" src="https://user-images.githubusercontent.com/98147070/190349782-b237c0da-879f-41b1-ad84-f64536580195.gif">
    
    - Firebase Database를 활용해 게시글 등록 및 수정
    - 이미지와 동영상은 Firebase Storage에 업로드
- #### 댓글 페이지
    - 게시글의 전체 컨텐츠 및 댓글과 답글을 보여주는 페이지
    - 댓글 및 답글 입력과 수정
    
      <img height="360px" src="https://user-images.githubusercontent.com/98147070/190349785-8d9bb89e-f131-48b2-9641-715d15383673.gif">

    - 댓글과 답글 카드 컴포넌트(좋아요)
- #### 검색 페이지
    - Algolia를 활용하여 검색 기능 구현
    
      <img height="360px" src="https://user-images.githubusercontent.com/98147070/190349790-77b86267-7ffc-49f1-bd7a-ebdccf17c4dc.gif">
    
    - 검색결과가 없을 경우 ‘해당하는 검색결과 없음” 표시
