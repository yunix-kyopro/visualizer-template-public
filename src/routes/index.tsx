import { useEffect } from 'react';
import type { FC } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import InitWasm from 'components/InitWasm';
import Home from 'components/templates/Home';

const IndexRoutes: FC = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [hash, pathname]);

  return (
    <Routes>
      <Route path="hoge">
        <Route path="" element={<InitWasm />} />
      </Route>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default IndexRoutes;
