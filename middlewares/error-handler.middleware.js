export default (err, req, res, next) => {
  //터미널에 에러 출력
  console.error(err);

  //데이터 검증 에러 처리
  if (err.name === 'ValidationError') {
    return res.status(400).json({ errorMessage: '규칙에 맞지 않는 데이터입니다.' });
  }

  //중복데이터 에러 처리
  if (err.code === 'P2002') {
    // 캐릭터 이름 중복 에러처리
    if (err.meta.target === 'Character_name_key') {
      return res.status(400).json({
        errorMessage: '이미 사용 중인 캐릭터 이름입니다.',
      });
    }
    //중복데이터 에러 처리 - 계정
    if (err.meta.target === 'Account_userID_key') {
      return res.status(400).json({
        errorMessage: '이미 등록된 계정 또는 이메일입니다.',
      });
    }
    //중복데이터 에러 처리 - 캐릭터 이름
    if (err.meta.target === 'Account_email_key') {
      return res.status(400).json({
        errorMessage: '사용 중인 캐릭터 이름입니다.',
      });
    }
    //중복데이터 에러 처리 - 이메일
    if (err.meta.target === 'Account_email_key') {
      return res.status(400).json({
        errorMessage: '이미 등록된 계정 또는 이메일입니다.',
      });
    }
  }

  // JSON 파싱 오류 처리
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      errorMessage: '잘못된 JSON 데이터입니다.',
    });
  }

  // 그 외 오류 시
  return res.status(500).json({ errorMessage: '서버에서 에러가 발생했습니다.' });
};
