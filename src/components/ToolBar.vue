<template>
  <div class="nav">
    <div class="container open-menu-container">
      <div class="logo-container">
        <Logo />
      </div>
      <div v-if="!isCustomDomain" class="tooltip-wrapper hide-three">
        <button class="nav-btn nav-btn--large" v-on:click="navigateToNewMarkup()"><span class="icon icon-stack"></span><span class="nav-text hide-markups-text">Markups</span></button>
        <span class="tooltip">New Markup & History</span>
      </div>
      <div v-if="!isCustomDomain" class="show-two show-two--left" v-click-outside="hideMarkupDropdown">
        <button class="nav-btn nav-btn--large" title="Markup Tools" :disabled="toolsDisabled" v-on:click.prevent="toggleMarkupDropdown()"><span class="icon" :class="markupIcon"></span><span class="icon icon-dropdown"></span></button>
        <div class="dropdown-menu dropdown-menu--left dropdown-menu--multi" v-if="showMarkupDropdown">
          <div class="dropdown-group">
            <button class="dropdown-group--ten" title="Text" v-on:click="selectToolWrapper(ToolNames.TextTool)" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.TextTool || currentSelectedTool === ToolNames.SignatureTool}"><span class="icon icon-text"></span></button>
            <button class="dropdown-group--ten" title="Arrow" v-on:click="selectToolWrapper(ToolNames.ArrowTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.ArrowTool}"><span class="icon icon-arrow"></span></button>
            <button class="dropdown-group--ten" title="Line" v-on:click="selectToolWrapper(ToolNames.LineTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.LineTool}"><span class="icon icon-line"></span></button>
            <button class="dropdown-group--ten" title="Rectangle" v-on:click="selectToolWrapper(ToolNames.RectangleTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.RectangleTool}"><span class="icon icon-rectangle"></span></button>
            <button class="dropdown-group--ten" title="Oval" v-on:click="selectToolWrapper(ToolNames.EllipseTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.EllipseTool}"><span class="icon icon-oval"></span></button>
            <button class="dropdown-group--ten" title="Blur" v-on:click="selectToolWrapper(ToolNames.BlurTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.BlurTool}"><span class="icon icon-blur"></span></button>
            <button class="dropdown-group--ten" title="Pen" v-on:click="selectToolWrapper(ToolNames.PenTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.PenTool}"><span class="icon icon-pen"></span></button>
            <button class="dropdown-group--ten" title="Highlighter" v-on:click="selectToolWrapper(ToolNames.HighlightTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.HighlightTool}"><span class="icon icon-highlighter"></span></button>
            <button class="dropdown-group--ten" title="Insert Image" v-on:click="insertImage()" :disabled="toolsDisabled"><span class="icon icon-insert-image"></span></button>
            <button class="dropdown-group--ten" title="Signature Box" v-on:click="setIsSignatureBoxOpen(true)" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.SignatureTool}" :disabled="toolsDisabled"></button>
            <button class="dropdown-group--ten" title="Crop" v-on:click="selectToolWrapper(ToolNames.CropTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.CropTool}"><span class="icon icon-crop"></span></button>
          </div>
          <hr>
          <div class="dropdown-group">
            <button title="Black" class="dropdown-group--six" v-on:click="selectColor('#000000')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#000000'}"><span class="color color1"></span></button>
            <button title="Gray" class="dropdown-group--six" v-on:click="selectColor('#545454')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#545454'}"><span class="color color2"></span></button>
            <button title="Light Gray" class="dropdown-group--six" v-on:click="selectColor('#ababab')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#ababab'}"><span class="color color3"></span></button>
            <button title="White" class="dropdown-group--six" v-on:click="selectColor('#ffffff')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#ffffff'}"><span class="color color4"></span></button>
            <button title="Blue" class="dropdown-group--six" v-on:click="selectColor('#4285f5')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#4285f5'}"><span class="color color5"></span></button>
            <button title="Green" class="dropdown-group--six" v-on:click="selectColor('#2ed355')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#2ed355'}"><span class="color color6"></span></button>
            <button title="Yellow" class="dropdown-group--six" v-on:click="selectColor('#fcd117')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#fcd117'}"><span class="color color7"></span></button>
            <button title="Orange" class="dropdown-group--six" v-on:click="selectColor('#f7931f')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#f7931f'}"><span class="color color8"></span></button>
            <button title="Red" class="dropdown-group--six" v-on:click="selectColor('#ef4037')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#ef4037'}"><span class="color color9"></span></button>
            <button title="Pink" class="dropdown-group--six" v-on:click="selectColor('#cd42b3')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#cd42b3'}"><span class="color color10"></span></button>
            <button title="Purple" class="dropdown-group--six" v-on:click="selectColor('#8e42cd')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#8e42cd'}"><span class="color color11"></span></button>
          </div>
          <hr>
          <div class="dropdown-group">
            <button class="dropdown-group--six" v-if="minLineThickness <= 1" v-on:click="selectLineThickness(1)" :disabled="toolsDisabled || sizeDisabled" v-bind:class="{ 'nav-btn--active': currentLineThickness === 1}"><span class="icon icon-line1"></span></button>
            <button class="dropdown-group--six" v-if="minLineThickness <= 2" v-on:click="selectLineThickness(2)" :disabled="toolsDisabled || sizeDisabled" v-bind:class="{ 'nav-btn--active': currentLineThickness === 2}"><span class="icon icon-line2"></span></button>
            <button class="dropdown-group--six" v-if="minLineThickness <= 3" v-on:click="selectLineThickness(3)" :disabled="toolsDisabled || sizeDisabled" v-bind:class="{ 'nav-btn--active': currentLineThickness === 3}"><span class="icon icon-line3"></span></button>
            <button class="dropdown-group--six" v-if="minLineThickness <= 4" v-on:click="selectLineThickness(4)" :disabled="toolsDisabled || sizeDisabled" v-bind:class="{ 'nav-btn--active': currentLineThickness === 4}"><span class="icon icon-line4"></span></button>
            <button class="dropdown-group--six" v-if="minLineThickness <= 5" v-on:click="selectLineThickness(5)" :disabled="toolsDisabled || sizeDisabled" v-bind:class="{ 'nav-btn--active': currentLineThickness === 5}"><span class="icon icon-line5"></span></button>
            <button class="dropdown-group--six" v-if="minLineThickness <= 6" v-on:click="selectLineThickness(6)" :disabled="toolsDisabled || sizeDisabled" v-bind:class="{ 'nav-btn--active': currentLineThickness === 6}"><span class="icon icon-line6"></span></button>
          </div>
          <hr>
          <div class="dropdown-group">
            <button class="dropdown-group--done" title="Done" :disabled="toolsDisabled" v-on:click.prevent="toggleMarkupDropdown()"><span class="nav-text">Done</span></button>
          </div>
        </div>
      </div>
      <div v-if="!isCustomDomain" class="tooltip-wrapper show-two">
        <button class="nav-btn nav-btn--small nav-btn--red" v-on:click="deleteCanvasObject()" :disabled="toolsDisabled || !isCanvasObjectSelected"><span class="icon icon-delete"></span></button>
        <span class="tooltip">Delete Object <span class="shortcut">(delete)</span></span>
      </div>
      <div v-if="!isCustomDomain" class="tooltip-wrapper show-two">
        <button class="nav-btn nav-btn--small" v-on:click="undo()" :disabled="!canUndo || toolsDisabled || currentSelectedTool === ToolNames.BlurTool"><span class="icon icon-undo"></span></button>
        <span class="tooltip">Undo <span v-if="isMacOs" class="shortcut">(⌘Z)</span><span v-if="!isMacOs" class="shortcut">(Ctrl+Z)</span></span>
      </div>
      <div v-if="!isCustomDomain" class="tooltip-wrapper show-two">
        <button class="nav-btn nav-btn--small" v-on:click="redo()" :disabled="!canRedo || toolsDisabled || currentSelectedTool === ToolNames.BlurTool"><span class="icon icon-redo"></span></button>
        <span class="tooltip">Redo <span v-if="isMacOs" class="shortcut">(⌘⇧Z)</span><span v-if="!isMacOs" class="shortcut">(Ctrl+Shift+Z)</span></span>
      </div>
    </div>
    <div v-if="!isCustomDomain" class="container hide-two">
      <div class="tooltip-wrapper hide-one">
        <button class="nav-btn" v-on:click="selectToolWrapper(ToolNames.TextTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.TextTool || currentSelectedTool === ToolNames.SignatureTool}"><span class="icon icon-text"></span></button>
        <span class="tooltip">Text</span>
      </div>
      <div class="tooltip-wrapper tooltip-wrapper-rr hide-one">
        <div v-if="lastUsedLineTool === ToolNames.ArrowTool">
          <button class="nav-btn" v-on:click="selectToolWrapper(ToolNames.ArrowTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.ArrowTool}"><span class="icon icon-arrow"></span></button>
          <span class="tooltip">Arrow</span>
        </div>
        <div v-if="lastUsedLineTool === ToolNames.LineTool">
          <button class="nav-btn" v-on:click="selectToolWrapper(ToolNames.LineTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.LineTool}"><span class="icon icon-line"></span></button>
          <span class="tooltip">Line</span>
        </div>
      </div>
      <div class="dropdown hide-one" v-click-outside="hideArrowDropdown">
        <div class="tooltip-wrapper tooltip-wrapper-rl">
          <button class="nav-btn nav-btn--large" :disabled="toolsDisabled" v-on:click.prevent="toggleArrowDropdown()"><span class="icon icon-dropdown"></span></button>
          <span class="tooltip">Change Tool</span>
        </div>
        <div class="dropdown-menu dropdown-menu--offset" v-if="showArrowDropdown">
          <button class="dropdown-item" title="Arrow" v-on:click="selectToolWrapper(ToolNames.ArrowTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.ArrowTool}"><span class="icon icon-arrow"></span><span class="nav-text">Arrow</span></button>
          <button class="dropdown-item" title="Line" v-on:click="selectToolWrapper(ToolNames.LineTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.LineTool}"><span class="icon icon-line"></span><span class="nav-text">Line</span></button>
        </div>
      </div>
      <div class="tooltip-wrapper tooltip-wrapper-rr hide-one">
        <div v-if="lastUsedShapeTool === ToolNames.RectangleTool">
          <button class="nav-btn" v-on:click="selectToolWrapper(ToolNames.RectangleTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.RectangleTool}"><span class="icon icon-rectangle"></span></button>
          <span class="tooltip">Rectangle</span>
        </div>
        <div v-if="lastUsedShapeTool === ToolNames.EllipseTool">
          <button class="nav-btn" v-on:click="selectToolWrapper(ToolNames.EllipseTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.EllipseTool}"><span class="icon icon-oval"></span></button>
          <span class="tooltip">Oval</span>
        </div>
        <div v-if="lastUsedShapeTool === ToolNames.BlurTool">
          <button class="nav-btn" v-on:click="selectToolWrapper(ToolNames.BlurTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.BlurTool}"><span class="icon icon-blur"></span></button>
          <span class="tooltip">Blur</span>
        </div>
      </div>
      <div class="dropdown hide-one" v-click-outside="hideRectangleDropdown">
        <div class="tooltip-wrapper tooltip-wrapper-rl">
          <button class="nav-btn nav-btn--large" :disabled="toolsDisabled" v-on:click.prevent="toggleRectangleDropdown()"><span class="icon icon-dropdown"></span></button>
          <span class="tooltip">Change Tool</span>
        </div>
        <div class="dropdown-menu dropdown-menu--offset" v-if="showRectangleDropdown">
          <button class="dropdown-item" title="Rectangle" v-on:click="selectToolWrapper(ToolNames.RectangleTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.RectangleTool}"><span class="icon icon-rectangle"></span><span class="nav-text">Rectangle</span></button>
          <button class="dropdown-item" title="Oval" v-on:click="selectToolWrapper(ToolNames.EllipseTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.EllipseTool}"><span class="icon icon-oval"></span><span class="nav-text">Oval</span></button>
          <button class="dropdown-item" title="Blur" v-on:click="selectToolWrapper(ToolNames.BlurTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.BlurTool}"><span class="icon icon-blur"></span><span class="nav-text">Blur</span></button>
        </div>
      </div>
      <div class="tooltip-wrapper tooltip-wrapper-rr hide-one">
        <div v-if="lastUsedPenTool === ToolNames.PenTool">
          <button class="nav-btn" v-on:click="selectToolWrapper(ToolNames.PenTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.PenTool}"><span class="icon icon-pen"></span></button>
          <span class="tooltip">Pen</span>
        </div>
        <div v-if="lastUsedPenTool === ToolNames.HighlightTool">
          <button class="nav-btn" v-on:click="selectToolWrapper(ToolNames.HighlightTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.HighlightTool}"><span class="icon icon-highlighter"></span></button>
          <span class="tooltip">Highlighter</span>
        </div>
      </div>
      <div class="dropdown hide-one" v-click-outside="hidePenDropdown">
        <div class="tooltip-wrapper tooltip-wrapper-rl">
          <button class="nav-btn nav-btn--large" :disabled="toolsDisabled" v-on:click.prevent="togglePenDropdown()"><span class="icon icon-dropdown"></span></button>
          <span class="tooltip">Change Tool</span>
        </div>
        <div class="dropdown-menu dropdown-menu--offset" v-if="showPenDropdown">
          <button class="dropdown-item" title="Pen" v-on:click="selectToolWrapper(ToolNames.PenTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.PenTool}"><span class="icon icon-pen"></span><span class="nav-text">Pen</span></button>
          <button class="dropdown-item" title="Highlighter" v-on:click="selectToolWrapper(ToolNames.HighlightTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.HighlightTool}"><span class="icon icon-highlighter"></span><span class="nav-text">Highlighter</span></button>
        </div>
      </div>
      <div class="dropdown show-one" v-click-outside="hideToolDropdown">
        <div class="tooltip-wrapper">
          <button class="nav-btn nav-btn--large" :disabled="toolsDisabled" v-on:click.prevent="toggleToolDropdown()"><span class="icon" :class="toolIcon"></span><span class="icon icon-dropdown"></span></button>
          <span class="tooltip">Markup Tools</span>
        </div>
        <div class="dropdown-menu dropdown-menu--left" v-if="showToolDropdown">
          <button class="dropdown-item" title="Text" v-on:click="selectToolWrapper(ToolNames.TextTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.TextTool}"><span class="icon icon-text"></span><span class="nav-text">Text</span></button>
          <button class="dropdown-item" title="Arrow" v-on:click="selectToolWrapper(ToolNames.ArrowTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.ArrowTool}"><span class="icon icon-arrow"></span><span class="nav-text">Arrow</span></button>
          <button class="dropdown-item" title="Line" v-on:click="selectToolWrapper(ToolNames.LineTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.LineTool}"><span class="icon icon-line"></span><span class="nav-text">Line</span></button>
          <button class="dropdown-item" title="Rectangle" v-on:click="selectToolWrapper(ToolNames.RectangleTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.RectangleTool}"><span class="icon icon-rectangle"></span><span class="nav-text">Rectangle</span></button>
          <button class="dropdown-item" title="Oval" v-on:click="selectToolWrapper(ToolNames.EllipseTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.EllipseTool}"><span class="icon icon-oval"></span><span class="nav-text">Oval</span></button>
          <button class="dropdown-item" title="Blur" v-on:click="selectToolWrapper(ToolNames.BlurTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.BlurTool}"><span class="icon icon-blur"></span><span class="nav-text">Blur</span></button>
          <button class="dropdown-item" title="Pen" v-on:click="selectToolWrapper(ToolNames.PenTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.PenTool}"><span class="icon icon-pen"></span><span class="nav-text">Pen</span></button>
          <button class="dropdown-item" title="Highlighter" v-on:click="selectToolWrapper(ToolNames.HighlightTool)" :disabled="toolsDisabled" v-bind:class="{ 'nav-btn--active': currentSelectedTool === ToolNames.HighlightTool}"><span class="icon icon-highlighter"></span><span class="nav-text">Highlighter</span></button>
        </div>
      </div>
      <div class="dropdown" v-click-outside="hideColorDropdown">
        <div class="tooltip-wrapper">
          <button class="nav-btn nav-btn--large" :disabled="toolsDisabled || colorDisabled" v-on:click.prevent="toggleColorDropdown()"><span class="color" :class="colorIcon"></span><span class="icon icon-dropdown"></span></button>
          <span class="tooltip">Color</span>
        </div>
        <div class="dropdown-menu dropdown-menu--left dropdown-menu--colors" v-if="showColorDropdown">
          <button title="Black" class="dropdown-item" v-on:click="selectColor('#000000')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#000000'}"><span class="color color1"></span></button>
          <button title="Gray" class="dropdown-item" v-on:click="selectColor('#545454')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#545454'}"><span class="color color2"></span></button>
          <button title="Light Gray" class="dropdown-item" v-on:click="selectColor('#ababab')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#ababab'}"><span class="color color3"></span></button>
          <button title="White" class="dropdown-item" v-on:click="selectColor('#ffffff')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#ffffff'}"><span class="color color4"></span></button>
          <button title="Blue" class="dropdown-item" v-on:click="selectColor('#4285f5')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#4285f5'}"><span class="color color5"></span></button>
          <button title="Green" class="dropdown-item" v-on:click="selectColor('#2ed355')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#2ed355'}"><span class="color color6"></span></button>
          <button title="Yellow" class="dropdown-item" v-on:click="selectColor('#fcd117')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#fcd117'}"><span class="color color7"></span></button>
          <button title="Orange" class="dropdown-item" v-on:click="selectColor('#f7931f')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#f7931f'}"><span class="color color8"></span></button>
          <button title="Red" class="dropdown-item" v-on:click="selectColor('#ef4037')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#ef4037'}"><span class="color color9"></span></button>
          <button title="Pink" class="dropdown-item" v-on:click="selectColor('#cd42b3')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#cd42b3'}"><span class="color color10"></span></button>
          <button title="Purple" class="dropdown-item" v-on:click="selectColor('#8e42cd')" :disabled="toolsDisabled || colorDisabled" v-bind:class="{ 'nav-btn--active': currentColor === '#8e42cd'}"><span class="color color11"></span></button>
        </div>
      </div>
      <div class="dropdown" v-click-outside="hideLineThicknessDropdown">
        <div class="tooltip-wrapper">
          <button class="nav-btn nav-btn--large" :disabled="toolsDisabled || sizeDisabled" v-on:click.prevent="toggleLineThicknessDropdown()"><span class="icon" :class="lineThicknessIcon"></span><span class="icon icon-dropdown"></span></button>
          <span class="tooltip">Line Thickness & Font Size</span>
        </div>
        <div class="dropdown-menu dropdown-menu--left" v-if="showLineThicknessDropdown">
          <button class="dropdown-item" v-if="minLineThickness <= 1" v-on:click="selectLineThickness(1)" :disabled="toolsDisabled || sizeDisabled" v-bind:class="{ 'nav-btn--active': currentLineThickness === 1}"><span class="icon icon-line1"></span><span class="nav-text">Size 1</span></button>
          <button class="dropdown-item" v-if="minLineThickness <= 2" v-on:click="selectLineThickness(2)" :disabled="toolsDisabled || sizeDisabled" v-bind:class="{ 'nav-btn--active': currentLineThickness === 2}"><span class="icon icon-line2"></span><span class="nav-text">Size 2</span></button>
          <button class="dropdown-item" v-if="minLineThickness <= 3" v-on:click="selectLineThickness(3)" :disabled="toolsDisabled || sizeDisabled" v-bind:class="{ 'nav-btn--active': currentLineThickness === 3}"><span class="icon icon-line3"></span><span class="nav-text">Size 3</span></button>
          <button class="dropdown-item" v-if="minLineThickness <= 4" v-on:click="selectLineThickness(4)" :disabled="toolsDisabled || sizeDisabled" v-bind:class="{ 'nav-btn--active': currentLineThickness === 4}"><span class="icon icon-line4"></span><span class="nav-text">Size 4</span></button>
          <button class="dropdown-item" v-if="minLineThickness <= 5" v-on:click="selectLineThickness(5)" :disabled="toolsDisabled || sizeDisabled" v-bind:class="{ 'nav-btn--active': currentLineThickness === 5}"><span class="icon icon-line5"></span><span class="nav-text">Size 5</span></button>
          <button class="dropdown-item" v-if="minLineThickness <= 6" v-on:click="selectLineThickness(6)" :disabled="toolsDisabled || sizeDisabled" v-bind:class="{ 'nav-btn--active': currentLineThickness === 6}"><span class="icon icon-line6"></span><span class="nav-text">Size 6</span></button>
        </div>
      </div>
      <div class="tooltip-wrapper">
        <button class="nav-btn nav-btn--small" v-on:click="insertImage()" :disabled="toolsDisabled"><span class="icon icon-insert-image"></span></button>
        <span class="tooltip">Insert Image <span v-if="isMacOs" class="shortcut">(⌘V)</span><span v-if="!isMacOs" class="shortcut">(Ctrl+V)</span></span>
      </div>
      <div class="tooltip-wrapper">
        <button class="nav-btn nav-btn--small" v-on:click="setIsSignatureBoxOpen(true)" :disabled="toolsDisabled"></button>
        <span class="tooltip">Signature Box</span>
      </div>
      <div class="tooltip-wrapper">
        <button class="nav-btn nav-btn--small" v-on:click="selectToolWrapper(ToolNames.CropTool)" :disabled="toolsDisabled"><span class="icon icon-crop"></span></button>
        <span class="tooltip">Crop</span>
      </div>
      <div class="tooltip-wrapper">
        <button class="nav-btn nav-btn--small nav-btn--red" v-on:click="deleteCanvasObject()" :disabled="toolsDisabled || !isCanvasObjectSelected"><span class="icon icon-delete"></span></button>
        <span class="tooltip">Delete Object <span class="shortcut">(delete)</span></span>
      </div>
      <div class="tooltip-wrapper">
        <button class="nav-btn nav-btn--small" v-on:click="undo()" :disabled="!canUndo || toolsDisabled || currentSelectedTool === ToolNames.BlurTool"><span class="icon icon-undo"></span></button>
        <span class="tooltip">Undo <span v-if="isMacOs" class="shortcut">(⌘Z)</span><span v-if="!isMacOs" class="shortcut">(Ctrl+Z)</span></span>
      </div>
      <div class="tooltip-wrapper">
        <button class="nav-btn nav-btn--small" v-on:click="redo()" :disabled="!canRedo || toolsDisabled || currentSelectedTool === ToolNames.BlurTool"><span class="icon icon-redo"></span></button>
        <span class="tooltip">Redo <span v-if="isMacOs" class="shortcut">(⌘⇧Z)</span><span v-if="!isMacOs" class="shortcut">(Ctrl+Shift+Z)</span></span>
      </div>
    </div>
    <div class="container">
      <div class="dropdown show-share" v-click-outside="hideShareDropdown">
        <div class="tooltip-wrapper">
          <button class="nav-btn nav-btn--large nav-btn--blue" :disabled="!showingMarkUp" v-on:click.prevent="toggleShareDropdown()"><span class="icon icon-share"></span><span class="icon icon-dropdown"></span></button>
          <span class="tooltip">Sharing Options</span>
        </div>
        <div class="dropdown-menu" v-if="showShareDropdown">
          <button class="dropdown-item" title="Copy share link to clipboard" v-on:click="copyShareLink()" :disabled="!showingMarkUp || markUpPrivate"><span class="icon icon-link"></span><span class="nav-text">Share link</span></button>
          <button class="dropdown-item" title="Copy markup to clipboard as image" v-if="isCopyImageSupported" v-on:click="copyImageToClipboard()" :disabled="!showingMarkUp"><span class="icon icon-copy"></span><span class="nav-text">Copy image</span></button>
          <button class="dropdown-item" title="Download markup as image" v-on:click="downloadImage()" :disabled="!showingMarkUp"><span class="icon icon-download"></span><span class="nav-text">Download image</span></button>
          <button class="dropdown-item" title="Export markup as PDF" v-on:click="exportAsPdf()" :disabled="!showingMarkUp"><span class="icon icon-export"></span><span class="nav-text">Export PDF</span></button>
          <button v-if="userPlanType === 'SuperHero' || userPlanType === 'Hero'" class="dropdown-item" title="Duplicate markup" v-on:click="duplicateMarkUp()" :disabled="!showingMarkUp || userPlanType === 'Sidekick'"><span class="icon icon-duplicate"></span><span class="nav-text">Duplicate markup</span></button>
        </div>
      </div>
      <div class="tooltip-wrapper hide-share">
        <button class="nav-btn nav-btn--large" v-on:click="copyShareLink()" v-bind:class="{ 'nav-btn--blue': canEditMarkUp }" :disabled="!showingMarkUp || markUpPrivate"><span class="icon icon-link"></span><span class="nav-text hide-share-text">Share</span></button>
        <span v-if="!markUpPrivate" class="tooltip">Copy Share Link</span>
        <span v-if="markUpPrivate" class="tooltip">Make Public To Share</span>
      </div>
      <div v-if="isCopyImageSupported" class="tooltip-wrapper hide-share">
        <button class="nav-btn nav-btn--large" v-on:click="copyImageToClipboard()" :disabled="!showingMarkUp"><span class="icon icon-copy"></span><span class="nav-text hide-share-text">Copy</span></button>
        <span class="tooltip">Copy Markup To Clipboard As Image</span>
      </div>
      <div class="dropdown hide-share" v-click-outside="hideShareDropdown">
        <div class="tooltip-wrapper">
          <button class="nav-btn nav-btn--large" :disabled="!showingMarkUp" v-on:click.prevent="toggleShareDropdown()"><span class="icon icon-download"></span><span class="nav-text hide-share-text">Download</span></button>
          <span class="tooltip">Download & Export Options</span>
        </div>
        <div class="dropdown-menu" v-if="showShareDropdown">
          <button class="dropdown-item" title="Download markup as image" v-on:click="downloadImage()" :disabled="!showingMarkUp"><span class="icon icon-download"></span><span class="nav-text">Download image</span></button>
          <button class="dropdown-item" title="Export markup as PDF" v-on:click="exportAsPdf()" :disabled="!showingMarkUp"><span class="icon icon-export"></span><span class="nav-text">Export PDF</span></button>
        </div>
      </div>
      <div v-if="userPlanType === 'SuperHero' || userPlanType === 'Hero'" class="tooltip-wrapper hide-share">
        <button class="nav-btn nav-btn--large" v-on:click="duplicateMarkUp()" v-bind:class="{ 'nav-btn--blue': !canEditMarkUp }" :disabled="!showingMarkUp || userPlanType === 'Sidekick'"><span class="icon icon-duplicate"></span><span class="nav-text hide-share-text">Duplicate</span></button>
        <span class="tooltip">Duplicate Markup</span>
      </div>
      <button v-if="!isAuthenticated && !isCustomDomain" class="nav-btn nav-btn--large nav-btn--green" title="Sign Up" v-on:click="signUp()"><span class="nav-text nav-text--even">Sign Up</span></button>
      <div v-if="isAuthenticated" class="dropdown" v-click-outside="hideAccountDropdown">
        <button class="nav-btn nav-btn--small nav-btn--account" title="My account" v-on:click.prevent="toggleAccountDropdown()"><span class="nav-text">{{userFirstLetter}}</span></button>
        <span class="notification-gradient" v-if="userPlanType !== 'SuperHero'"></span>
        <div class="dropdown-menu" v-if="showAccountDropdown">
          <button class="dropdown-item" v-on:click="navigateToNewMarkup()"><span class="icon icon-stack"></span><span class="nav-text">My markups</span></button>
          <button class="dropdown-item" v-on:click="navigateToAccount()"><span class="icon icon-account"></span><span class="nav-text">My account</span></button>
          <button class="dropdown-item" v-on:click="navigateToSettings()"><span class="icon icon-settings"></span><span class="nav-text">My settings</span></button>
          <button class="dropdown-item" v-on:click="navigateToTeam()" v-if="userDetails.isTeamOwner"><span class="icon icon-team"></span><span class="nav-text">My team</span></button>
          <button class="dropdown-item" v-on:click="navigateToWhatIsNew()"><span class="icon icon-star"></span><span class="nav-text">What's new</span></button>
          <button class="dropdown-item" v-if="userPlanType !== 'SuperHero'" v-on:click="navigateToUpgrade"><span class="icon icon-arrow color-gradient"></span><span class="nav-text nav-text--gradient">Upgrade</span></button>
          <button class="dropdown-item" v-on:click="signOut()"><span class="icon icon-log-out"></span><span class="nav-text">Log out</span></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  // eslint-disable-next-line no-unused-vars
  import {MARKUP_EXPORT_PIXEL_RATIO, Notifications, ToolNames, TOUCH_MIN_LINE_THICKNESS} from "../constants";
  import {getMarkUpShareUrl, duplicateMarkUp, exportMarkUpAsPdf} from "../services/markUpService";
  import {copyPngToClipboard, copyTextToClipboard, downloadDataUrl} from "../utils";
  import { mapMutations, mapState } from "vuex";
  import {signOut} from "../services/authService";
  import navigationPresets from "../navigationPresets";
  import EventBus from '../stores/eventBus';
  import {
    trackInsertImage,
    trackMarkUpCopy,
    trackMarkUpDownload,
    trackMarkUpDuplicate,
    trackMarkUpShare
  } from "../services/analytics";
  import {trackBlur, trackCrop, trackTrackPdfExport} from "@/services/analytics";
  import Logo from "@/components/Shared/Logo";

  export default {
    name: "ToolBar",
    props: [],
    components: { Logo },
    data() {
      return {
        showShareDropdown: false,
        showAccountDropdown: false,
        showToolDropdown: false,
        showArrowDropdown: false,
        showRectangleDropdown: false,
        showPenDropdown: false,
        showLineThicknessDropdown: false,
        showColorDropdown: false,
        showMarkupDropdown: false,
        isCopyImageSupported: navigator.clipboard && navigator.clipboard.write,
        ToolNames
      };
    },
    computed: {
      toolsDisabled() {
        return !this.showingMarkUp || !this.canEditMarkUp || !this.isCanvasLive || this.markUpHidden;
      },
      sizeDisabled() {
        return this.currentSelectedTool === ToolNames.ImageTool || this.currentSelectedTool === ToolNames.BlurTool || this.currentSelectedTool === ToolNames.CropTool;
      },
      colorDisabled() {
        return this.currentSelectedTool === ToolNames.ImageTool || this.currentSelectedTool === ToolNames.BlurTool || this.currentSelectedTool === ToolNames.CropTool;
      },
      showingMarkUp() {
        return this.markUp && this.isCanvasLive;
      },
      userFirstLetter() {
        if (!this.isAuthenticated) {
          return '';
        }

        if (this.userFirstName) {
          return this.userFirstName.substring(0, 1).toUpperCase();
        }

        return this.userEmail.substring(0, 1).toUpperCase();
      },
      lineThicknessIcon() {
        if (this.currentLineThickness !== null) {
          return `icon-line${this.currentLineThickness}`;
        }

        return `icon-line-null`;
      },
      colorIcon() {
        let colorNumber = null;

        switch (this.currentColor) {
          case '#000000':
            colorNumber = 1;
            break;
          case '#545454':
            colorNumber = 2;
            break;
          case '#ababab':
            colorNumber = 3;
            break;
          case '#ffffff':
            colorNumber = 4;
            break;
          case '#4285f5':
            colorNumber = 5;
            break;
          case '#2ed355':
            colorNumber = 6;
            break;
          case '#fcd117':
            colorNumber = 7;
            break;
          case '#f7931f':
            colorNumber = 8;
            break;
          case '#ef4037':
            colorNumber = 9;
            break;
          case '#cd42b3':
            colorNumber = 10;
            break;
          case '#8e42cd':
            colorNumber = 11;
            break;
          default:
            colorNumber = null;
            break;
        }

        if (colorNumber != null) {
          return `color${colorNumber}`;
        }

        return `color-null`;
      },
      toolIcon() {
        if (this.currentSelectedTool != null) {
          return `icon-${this.currentSelectedTool}`;
        }

        return `tool-null`;
      },
      markupIcon() {
        let colorNumber = null;

        switch (this.currentColor) {
          case '#000000':
            colorNumber = 1;
            break;
          case '#545454':
            colorNumber = 2;
            break;
          case '#ababab':
            colorNumber = 3;
            break;
          case '#ffffff':
            colorNumber = 4;
            break;
          case '#4285f5':
            colorNumber = 5;
            break;
          case '#2ed355':
            colorNumber = 6;
            break;
          case '#fcd117':
            colorNumber = 7;
            break;
          case '#f7931f':
            colorNumber = 8;
            break;
          case '#ef4037':
            colorNumber = 9;
            break;
          case '#cd42b3':
            colorNumber = 10;
            break;
          case '#8e42cd':
            colorNumber = 11;
            break;
          default:
            colorNumber = null;
            break;
        }

        if (this.currentSelectedTool !== null) {
          return `icon-${this.currentSelectedTool} color${colorNumber}`;
        }

        return `tool-null`;
      },
      minLineThickness() {
        if (this.isTouchDevice) return TOUCH_MIN_LINE_THICKNESS;

        return 0;
      },
      isCustomDomain() {
        return this.teamBrand && this.teamBrand.isCustomDomain;
      },
      ...mapState([
        'currentSelectedTool',
        'lastUsedTool',
        'lastUsedPenTool',
        'lastUsedLineTool',
        'lastUsedShapeTool',
        'markUpId',
        'markUpPageNumber',
        'markUpImageIdentifier',
        'markUpPrivate',
        'markUp',
        'markUpStage',
        'isAuthenticated',
        'userFirstName',
        'userEmail',
        'canEditMarkUp',
        'isCanvasLive',
        'currentLineThickness',
        'currentColor',
        'canUndo',
        'canRedo',
        'isMacOs',
        'userDetails',
        'userPlanType',
        'isTouchDevice',
        'isCanvasObjectSelected',
        'teamBrand'
      ])
    },
    mounted() {
      if (this.isTouchDevice && this.currentLineThickness < this.minLineThickness) {
        this.setLineThickness(this.minLineThickness);
      }
    },
    methods: {
      async downloadImage() {
        try {
          this.setLoading(true);
          this.resetTool();
          this.showShareDropdown = false;
          const dataUrl = this.markUpStage.toDataURL({
            pixelRatio: MARKUP_EXPORT_PIXEL_RATIO
          });
          downloadDataUrl(dataUrl, `markuphero-${this.markUpId}-${this.markUpPageNumber}.png`);
          this.setLoading(false);
          trackMarkUpDownload(this.markUpId, this.canEditMarkUp);
        } catch (err) {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      async copyShareLink() {
        await copyTextToClipboard(getMarkUpShareUrl({
          markUpId: this.markUpId,
          pageNumber: this.markUpPageNumber,
          isTeamMember: this.teamBrand.isTeamMember,
          customDomain: this.teamBrand.customDomain
        }));
        this.showLinkCopiedMsg();
        this.showShareDropdown = false;
        trackMarkUpShare(this.markUpId, this.canEditMarkUp);
      },
      async copyImageToClipboard() {
        if (this.markUpStage) {
          this.resetTool();
          const dataUrl = this.markUpStage.toDataURL({
            pixelRatio: MARKUP_EXPORT_PIXEL_RATIO
          });
          await copyPngToClipboard(dataUrl);
          this.showMarkupCopiedMsg();
          trackMarkUpCopy(this.markUpId, this.canEditMarkUp);
        }
        this.showShareDropdown = false;
      },
      navigateToNewMarkup() {
        this.$router.push('/new');
      },
      navigateToRoot() {
        this.$router.push('/');
      },
      signUp() {
        this.$router.push('/signUp');
      },
      navigateToAccount() {
        this.$router.push('/account');
      },
      toggleShareDropdown() {
        this.showToolDropdown = false;
        this.showArrowDropdown = false;
        this.showRectangleDropdown = false;
        this.showPenDropdown = false;
        this.showLineThicknessDropdown = false;
        this.showColorDropdown = false;
        this.showMarkupDropdown = false;
        this.showAccountDropdown = false;
        this.showShareDropdown = !this.showShareDropdown;
      },
      toggleAccountDropdown() {
        this.showToolDropdown = false;
        this.showArrowDropdown = false;
        this.showRectangleDropdown = false;
        this.showPenDropdown = false;
        this.showLineThicknessDropdown = false;
        this.showColorDropdown = false;
        this.showMarkupDropdown = false;
        this.showShareDropdown = false;
        this.showAccountDropdown = !this.showAccountDropdown;
      },
      toggleToolDropdown() {
        this.showShareDropdown = false;
        this.showLineThicknessDropdown = false;
        this.showColorDropdown = false;
        this.showAccountDropdown = false;
        this.showToolDropdown = !this.showToolDropdown;
      },
      toggleArrowDropdown() {
        this.showShareDropdown = false;
        this.showLineThicknessDropdown = false;
        this.showColorDropdown = false;
        this.showAccountDropdown = false;
        this.showRectangleDropdown = false;
        this.showPenDropdown = false;
        this.showArrowDropdown = !this.showArrowDropdown;
      },
      toggleRectangleDropdown() {
        this.showShareDropdown = false;
        this.showLineThicknessDropdown = false;
        this.showColorDropdown = false;
        this.showAccountDropdown = false;
        this.showArrowDropdown = false;
        this.showPenDropdown = false;
        this.showRectangleDropdown = !this.showRectangleDropdown;
      },
      togglePenDropdown() {
        this.showShareDropdown = false;
        this.showLineThicknessDropdown = false;
        this.showColorDropdown = false;
        this.showAccountDropdown = false;
        this.showArrowDropdown = false;
        this.showRectangleDropdown = false;
        this.showPenDropdown = !this.showPenDropdown;
      },
      toggleLineThicknessDropdown() {
        this.showShareDropdown = false;
        this.showToolDropdown = false;
        this.showArrowDropdown = false;
        this.showRectangleDropdown = false;
        this.showPenDropdown = false;
        this.showColorDropdown = false;
        this.showAccountDropdown = false;
        this.showLineThicknessDropdown = !this.showLineThicknessDropdown;
      },
      toggleMarkupDropdown() {
        this.showShareDropdown = false;
        this.showToolDropdown = false;
        this.showColorDropdown = false;
        this.showLineThicknessDropdown = false;
        this.showAccountDropdown = false;
        this.showMarkupDropdown = !this.showMarkupDropdown;
      },
      selectLineThickness(lineThickness) {
        this.showLineThicknessDropdown = false;
        this.setLineThickness(lineThickness);
      },
      toggleColorDropdown() {
        this.showShareDropdown = false;
        this.showToolDropdown = false;
        this.showArrowDropdown = false;
        this.showRectangleDropdown = false;
        this.showPenDropdown = false;
        this.showLineThicknessDropdown = false;
        this.showAccountDropdown = false;
        this.showColorDropdown = !this.showColorDropdown;
      },
      selectColor(color) {
        this.showColorDropdown = false;
        this.setCurrentColor(color);
      },
      async signOut() {
        this.setLoading(true);
        await signOut();
        this.setUser(null);
        this.setLoading(false);
        this.navigateToRoot();
      },
      hideShareDropdown: (self) => {
        if (self.showShareDropdown !== false) {
          self.showShareDropdown = false;
        }
      },
      hideAccountDropdown: (self) => {
        if (self.showAccountDropdown !== false) {
          self.showAccountDropdown = false;
        }
      },
      hideToolDropdown: (self) => {
        if (self.showToolDropdown !== false) {
          self.showToolDropdown = false;
        }
      },
      hideArrowDropdown: (self) => {
        if (self.showArrowDropdown !== false) {
          self.showArrowDropdown = false;
        }
      },
      hideRectangleDropdown: (self) => {
        if (self.showRectangleDropdown !== false) {
          self.showRectangleDropdown = false;
        }
      },
      hidePenDropdown: (self) => {
        if (self.showPenDropdown !== false) {
          self.showPenDropdown = false;
        }
      },
      hideLineThicknessDropdown: (self) => {
        if (self.showLineThicknessDropdown !== false) {
          self.showLineThicknessDropdown = false;
        }
      },
      hideColorDropdown: (self) => {
        if (self.showColorDropdown !== false) {
          self.showColorDropdown = false;
        }
      },
      hideMarkupDropdown: (self) => {
        if (self.showMarkupDropdown !== false) {
          self.showMarkupDropdown = false;
        }
      },
      selectToolWrapper(tool) {
        this.showToolDropdown = false;
        this.showArrowDropdown = false;
        this.showRectangleDropdown = false;
        this.showPenDropdown = false;

        if (tool === ToolNames.BlurTool) trackBlur(this.markUpId, this.userPlanType);
        else if (tool === ToolNames.CropTool) trackCrop(this.markUpId, this.userPlanType);

        if (this.userPlanType !== 'SuperHero') {
          if (tool === ToolNames.BlurTool) return this.openUpgradeModal('blur');
          if (tool === ToolNames.CropTool) return this.openUpgradeModal('crop');
        }

        this.selectTool(tool);
      },
      async duplicateMarkUp() {
        this.setLoading(true);
        try {
          this.showShareDropdown = false;
          const newMarkUp = await duplicateMarkUp(this.markUpId);
          this.showMarkUpDuplicatedMsg();
          trackMarkUpDuplicate(this.markUpId, this.canEditMarkUp);
          this.navigateToMarkUp(newMarkUp.id);
          setTimeout(async () => {
            EventBus.$emit('refreshAllHistory');
          }, 350);
        } catch {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      undo() {
        EventBus.$emit('undo');
      },
      redo() {
        EventBus.$emit('redo');
      },
      insertImage() {
        trackInsertImage(this.markUpId, this.userPlanType);

        if (this.userPlanType !== 'SuperHero') return this.openUpgradeModal('insert-image');

        if (this.currentSelectedTool === ToolNames.CropTool) this.selectTool(this.lastUsedTool);
        EventBus.$emit('addAttachment');
      },
      deleteCanvasObject() {
        EventBus.$emit('deleteCanvasObject');
      },
      resetTool() {
        const currentTool = this.currentSelectedTool;
        this.selectTool(null);
        this.selectTool(currentTool);
      },
      async exportAsPdf() {
        this.showShareDropdown = false;

        if (this.userPlanType !== 'SuperHero') return this.openUpgradeModal('export');

        this.setLoading({
          isLoading: true,
          loaderStyle: 'exportPdf'
        });
        try {
          const downloadLink = await exportMarkUpAsPdf(this.markUpId);
          window.location.href = downloadLink;
          trackTrackPdfExport(this.markUpId);
        } catch {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      ...navigationPresets,
      ...mapMutations([
        'selectTool',
        'setUser',
        'setLoading',
        'setLineThickness',
        'setCurrentColor',
        'openUpgradeModal',
        'setIsSignatureBoxOpen'
      ])
    },
    notifications: Notifications,
  }
</script>

<style scoped>
  @import '../styles/globalShared.css';

  div.nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 60px;
    background: #21252B;
    z-index: 25;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  div.container {
    display: flex;
    align-items: center;
    margin: 0 5px;
    position: relative;
  }

  div.open-menu-container {
    position: static;
  }

  button:disabled {
    cursor: not-allowed;
    background-color: #282C34;
  }

  button:disabled span.icon, button:disabled span.color-null {
    background-color: #5E656F;
  }

  button:disabled span.nav-text {
    color: #5E656F;
  }

  div.show-one, div.show-share, div.show-two {
    display: none;
  }

  @media screen and (max-width: 1460px) {
    span.hide-share-text {
      display: none;
    }
  }

  @media screen and (max-width: 1238px) {
    div.show-share {
      display: block;
    }
    div.hide-share {
      display: none;
    }
  }

  @media screen and (max-width: 1140px) {
    div.hide-one {
      display: none;
    }
    div.show-one {
      display: block;
    }
  }

  @media screen and (max-width: 840px) {
    span.hide-markups-text {
      display: none;
    }
  }

  @media screen and (max-width: 777px) {
    div.hide-two {
      display: none;
    }
    div.show-two {
      display: block;
    }
  }

  @media screen and (max-width: 520px) {
    div.hide-three {
      display: none;
    }
    div.container {
      margin: 0;
    }
    div.show-two--left {
      margin-left: 5px;
    }
    div.tooltip-wrapper {
      margin: 0 5px 0 0;
    }
    button.nav-btn {
      margin: 0 5px 0 0;
    }
    button.nav-btn--small {
      width: 30px;
    }
    span.icon {
      width: 30px;
    }
    span.icon-dropdown {
      width: 24px;
    }
    button.nav-btn--account, div.dropdown-menu span.icon {
      width: 40px;
    }
  }

  div.logo-container {
    height: 40px;
  }

  @media screen and (max-width: 359px) {
    div.logo-container {
      display: none;
    }
  }
</style>