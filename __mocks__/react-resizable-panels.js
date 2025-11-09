/**
 * Jest mock for react-resizable-panels used in integration tests.
 * Provides minimal shims so components like CMSLayout can render in jsdom
 * without pulling in the real ESM implementation.
 */
const PanelGroup = ({ children }) => children;
const Panel = ({ children }) => children;
const PanelResizeHandle = () => null;

module.exports = { PanelGroup, Panel, PanelResizeHandle };