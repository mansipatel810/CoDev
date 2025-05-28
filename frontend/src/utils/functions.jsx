import React from 'react'

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return <i className="ri-javascript-line text-yellow-400" />;
    case 'ts':
    case 'tsx':
      return <i className="ri-code-s-slash-line text-blue-400" />;
    case 'json':
      return <i className="ri-braces-line text-green-400" />;
    case 'html':
      return <i className="ri-html5-line text-orange-500" />;
    case 'css':
      return <i className="ri-css3-line text-blue-400" />;
    case 'scss':
    case 'sass':
      return <i className="ri-brush-line text-pink-400" />;
    case 'md':
      return <i className="ri-markdown-line text-gray-400" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'bmp':
    case 'webp':
      return <i className="ri-image-line text-pink-400" />;
    case 'pdf':
      return <i className="ri-file-pdf-line text-red-500" />;
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
      return <i className="ri-file-zip-line text-yellow-700" />;
    case 'txt':
      return <i className="ri-file-text-line text-gray-300" />;
    case 'env':
      return <i className="ri-shield-keyhole-line text-green-700" />;
    case 'sh':
    case 'bash':
      return <i className="ri-terminal-box-line text-gray-400" />;
    case 'lock':
      return <i className="ri-lock-line text-gray-400" />;
    case 'yml':
    case 'yaml':
      return <i className="ri-settings-5-line text-yellow-400" />;
    case 'xml':
      return <i className="ri-code-s-slash-line text-orange-400" />;
    case 'py':
      return <i className="ri-python-line text-yellow-500" />;
    case 'java':
      return <i className="ri-java-line text-orange-700" />;
    case 'c':
    case 'h':
      return <i className="ri-copyright-line text-blue-700" />;
    case 'cpp':
    case 'hpp':
      return <i className="ri-copyright-line text-blue-400" />;
    case 'go':
      return <i className="ri-go-line text-cyan-400" />;
    case 'php':
      return <i className="ri-php-line text-indigo-400" />;
    case 'rb':
      return <i className="ri-ruby-line text-red-400" />;
    case 'swift':
      return <i className="ri-swift-line text-orange-400" />;
    case 'vue':
      return <i className="ri-vuejs-line text-green-400" />;
    case 'dockerfile':
      return <i className="ri-docker-line text-blue-400" />;
    case 'bat':
      return <i className="ri-terminal-box-line text-gray-400" />;
    case 'ini':
      return <i className="ri-settings-3-line text-gray-400" />;
    case 'log':
      return <i className="ri-article-line text-gray-400" />;
    default:
      return <i className="ri-file-line" />;
  }
}

function getFolderIcon(folderName, isOpen) {
  const name = folderName.toLowerCase();
  if (name === "routes") return <i className={`ri-git-branch-line text-blue-400`} />;
  if (name === "controllers") return <i className={`ri-settings-3-line text-purple-400`} />;
  if (name === "screens" || name === "pages") return <i className={`ri-window-line text-green-400`} />;
  if (name === "public") return <i className={`ri-earth-line text-yellow-400`} />;
  if (name === "models") return <i className={`ri-database-2-line text-pink-400`} />;
  if (name === "utils" || name === "helpers") return <i className={`ri-tools-line text-gray-400`} />;
  if (name === "config") return <i className={`ri-settings-5-line text-blue-400`} />;
  if (name === "assets") return <i className={`ri-folder-image-line text-pink-400`} />;
  if (name === "node_modules") return <i className={`ri-npmjs-line text-red-400`} />;
  if (name === "test" || name === "tests" || name === "__tests__") return <i className={`ri-test-tube-line text-green-400`} />;
  if (name === "middleware") return <i className={`ri-shield-user-line text-orange-400`} />;
  if (name === "hooks") return <i className={`ri-hook-line text-purple-400`} />;
  if (name === "services") return <i className={`ri-service-line text-blue-400`} />;
  // Default folder icon
  return <i className={`ri-folder-${isOpen ? "open" : "line"}`} />;
}

export { getFileIcon, getFolderIcon };
