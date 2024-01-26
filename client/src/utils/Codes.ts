import { Component } from '../../../docs/types';
import { convertObjToArr } from './convertBetweenObjArr';
import TreeNode from './treeNode';

export default class Codes {
  components: Component[];
  tree: TreeNode;
  title: string;
  constructor(components: Component[], tree: TreeNode, title: string) {
    this.components = components;
    this.tree = tree;
    this.title = title;
  }

  convertToCode(): { jsx: { [key: string]: string }; css: string } {
    const components = this.components;
    const tree = this.tree;
    const jsx: { [key: string]: string } = {};
    const position: { [key: number]: { top: number; left: number } } = {};
    let css: string = '';

    if (!components || this.components.length === 0)
      throw new Error('Converting code: design has no components');
    if (!components[0].rectangle)
      throw new Error('Converting code: RootContainer has no rectangle');

    const rootWidth = components[0].rectangle.width;
    const rootHeight = components[0].rectangle.height;
    position[components[0]._id] = { top: 0, left: 0 };

    css += `:root {
  --root-width: ${rootWidth}px;
  --root-height: ${rootHeight}px;
}
`;

    let stack = [tree];
    while (stack.length > 0) {
      const cur = stack.pop();
      if (!cur) throw new Error('Converting to code: component is undefined');

      const component: Component | undefined = components.find(
        (item: Component) => item._id === cur.id
      );
      if (!component)
        throw new Error('Converting to code: cannot find component');

      jsx[component.name] = this.jsx(component, cur.children, jsx);
      css += this.css(component, position, rootWidth, rootHeight);
      stack = stack.concat(cur.children);
    }

    return { jsx, css };
  }

  css(
    component: Component,
    position: { [key: number]: { top: number; left: number } },
    rootWidth: number,
    rootHeight: number
  ): string {
    let css = '';

    const { name, rectangle, styles, parent_id, _id } = component;
    if (!rectangle)
      throw new Error(`Converting css: component ${name} has no rectangle`);

    const {
      x_position,
      y_position,
      z_index,
      width,
      height,
      borderwidth,
      borderradius,
      backgroundcolor,
      stroke,
    } = rectangle;

    const i = component.index;
    let parentPos: any;
    if (i > 0) {
      parentPos = position[parent_id];
      position[_id] = { top: y_position, left: x_position };
    }

    css += `\n\n#${name}-${i} {
  position: ${i === 0 ? 'relative' : 'absolute'};
  width: calc(var(--root-width) * ${
    Math.round((width / rootWidth) * 1000) / 1000
  });
  height: calc(var(--root-height) * ${
    Math.round((height / rootHeight) * 1000) / 1000
  });
  border-color: ${stroke};`;
    if (i > 0) {
      css += `
  left: calc(var(--root-width) * ${
    Math.round(((x_position - parentPos.left) / rootWidth) * 1000) / 1000
  });
  top: calc(var(--root-height) * ${
    Math.round(((y_position - parentPos.top) / rootHeight) * 1000) / 1000
  });`;
    }
    if (borderwidth > 0) css += `\n  border-width: ${borderwidth}px;`;
    if (borderradius) css += `\n  border-radius: ${borderradius}%;`;
    if (styles.filter(({ key, value }) => key === 'border-style').length === 0)
      css += `\n  border-style: solid;`;
    if (backgroundcolor) css += `\n  background-color: ${backgroundcolor};`;
    if (z_index) css += `\n  z-index: ${z_index};`;
    styles.forEach(({ key, value }) => {
      if (value.length > 0) {
        css += `\n  ${key}: ${value};`;
      }
    });
    css += '\n}';

    return css;
  }

  jsx(
    component: Component,
    children: TreeNode[],
    jsx: { [key: string]: string }
  ): string {
    const { html_tag, inner_html, name } = component;
    const childrenComps = children.map((child) =>
      this.components.find((item) => item._id === child.id)
    );

    // import React and styles
    // import { useEffect } if component is root
    let code: string =
      "import './styles.css';\n" +
      `import React${
        component.index === 0 ? ', { useEffect }' : ''
      } from 'react';\n`;

    // import children
    if (children.length > 0) {
      const childrenNames = new Set(
        childrenComps.map((childComponent) => {
          if (!childComponent)
            throw new Error('Converting jsx: component has an undefined child');
          return childComponent.name;
        })
      );
      childrenNames.forEach((childName) => {
        code += `import ${childName} from './${childName}.jsx'\n`;
      });
    }

    let propKeys = new Set(component.props.map(({ key }) => key));
    if (jsx[name]) {
      const jsxStr = jsx[name];
      const functionRegex = new RegExp(
        `function\\s+${name}\\(\\{\\s*([^)]*?)\\s*\\}\\)`
      );
      const matches = jsxStr.match(functionRegex);
      if (matches) {
        const oldPropKeys: Set<string> = new Set(matches[1].split(', '));
        propKeys = new Set([...propKeys, ...oldPropKeys]);
        propKeys.delete('id');
        childrenComps.forEach((child, i) => propKeys.delete(`childId${i + 1}`));
      }
    }

    let propsCode: string = '';
    if (component.index === 0) {
      propsCode +=
        '{ ' +
        [
          'setTitle',
          ...propKeys,
          ...childrenComps.map((child, i) => `childId${i + 1}`),
        ].join(', ') +
        ' }';
    } else
      propsCode =
        '{ ' +
        [
          'id',
          ...propKeys,
          ...childrenComps.map((child, i) => `childId${i + 1}`),
        ].join(', ') +
        ' }';

    code += `\n export default function ${name}(${propsCode}) {\n`;
    if (component.index === 0) {
      code += `\n  useEffect(() => setTitle("${this.title}"), [setTitle]);\n\n`;
    }

    const classAndId = ` className='${component.name}' id=${
      component.index > 0 ? '{id}' : "'RootContainer-0'"
    }>`;
    code += `  return (
    ${html_tag.replace('>', classAndId)}`;

    if (children.length === 0) {
      code += `
      ${inner_html}
    ${html_tag.replace('<', '</')}
  );
}`;
    } else {
      childrenComps.forEach((child, i) => {
        if (!child)
          throw new Error('Converting jsx: component has an undefined child');

        const childNode = this.tree.searchNode(child._id);
        if (!childNode)
          throw new Error('Converting jsx: child is not in the tree');

        const grandchildrenComps = childNode.children.map((grandchild) =>
          this.components.find((item) => item._id === grandchild.id)
        );
        let grandChildrenCode: string = '';
        if (grandchildrenComps.length > 0) {
          grandChildrenCode += grandchildrenComps
            .map((grandchild, i) => {
              if (!grandchild)
                throw new Error(
                  `Converting jsx: component ${component.name}'s child ${child.name} has an undefined child`
                );
              return `childId${i + 1}='${grandchild.name}'`;
            })
            .join(' ');
        }

        let childPropsCode: string = '';
        if (child.props.length > 0) {
          childPropsCode += child.props
            .map(({ key, value }) =>
              value[0] === '{' && value[value.length - 1] === '}'
                ? `${key}=${value}`
                : `${key}={'${value}'}`
            )
            .join(' ');
        }
        code += `
      <${child.name} id=${
          component.index > 0
            ? `{childId${i + 1}}`
            : `'${child.name}-${child.index}'`
        } ${[grandChildrenCode, childPropsCode].join(' ')}/>`;
      });
      code += `
    </div>
  );
}`;
    }
    return code;
  }

  // childPropsCode(child: Component) {
  //   const childNode = this.tree.searchNode(child._id);
  //   if (!childNode)
  //     throw new Error('parsing childPropsCode: cannot find child in tree');
  // }
}
