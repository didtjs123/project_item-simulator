export default (err, req, res, next) => {
  //터미널에 에러 출력
  console.error(err);

  //데이터 검증 에러 처리
  if (err.name === 'ValidationError') {
    return res.status(400).json({ errorMessage: '규격에 맞는 값을 넣어주세요.' });
  }

  //중복데이터 에러 처리
  if (err.code === 'P2002') {
    return res.status(400).json({
      errorMessage: '이미 등록되어 있는 정보입니다.',
    });
  }

  // JSON 파싱 오류 처리
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      errorMessage: '잘못된 JSON 데이터입니다.',
    });
  }
  return res.status(500).json({ errorMessage: '서버에서 에러가 발생했습니다.' });
};
