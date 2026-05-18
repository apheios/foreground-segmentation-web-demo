import { useEffect, useMemo, useState } from "react";

import { Page1Demo } from "./components/page1/Page1Demo";
import { Page2Demo } from "./components/page2/Page2Demo";
import { ImagePreviewModal } from "./components/shared/ImagePreviewModal";
import { PageSwitcher } from "./components/shared/PageSwitcher";
import type { PageKey, PreviewContent } from "./types";

const validPages: PageKey[] = ["page1", "page2"];

function getInitialPage(): PageKey {
  const searchPage = new URLSearchParams(window.location.search).get("page");
  return validPages.includes(searchPage as PageKey) ? (searchPage as PageKey) : "page1";
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>(getInitialPage);
  const [preview, setPreview] = useState<PreviewContent | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", currentPage);
    window.history.replaceState({}, "", url);
    document.title = currentPage === "page2" ? "训练数据评估展示" : "前景分割模型展示";
  }, [currentPage]);

  const shellClassName = useMemo(
    () => `page-shell ${currentPage === "page2" ? "page-shell-page2" : "page-shell-page1"}`,
    [currentPage]
  );

  return (
    <main className={shellClassName}>
      <PageSwitcher currentPage={currentPage} onChange={(page) => setCurrentPage(page)} />
      {currentPage === "page2" ? (
        <Page2Demo onOpenPreview={setPreview} />
      ) : (
        <Page1Demo onOpenPreview={setPreview} />
      )}
      <ImagePreviewModal preview={preview} onClose={() => setPreview(null)} />
    </main>
  );
}
