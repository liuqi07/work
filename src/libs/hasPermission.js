const hasPermission = {
  install(Vue, options) {
    Vue.directive("hasPermission", {
      bind(el, binding, vnode) {
        // console.log("%c el, binding, vnode", "color:red;", el, binding, vnode);
        //   let permissionList = vnode.context.$route.meta.permission;
        const accessRoutes = vnode.context.$store.state.user.accessRoutes;
        const name = vnode.context.$route.name;
        let buttons = [];
        accessRoutes.map(r => {
          if (r.name === name) {
            buttons = r.buttons;
          } else {
            r.children && r.children.length > 0 && r.children.map(c => {
                if(c.name===name){
                    buttons = c.buttons
                }
            });
          }
        });
        const isBtn = buttons && buttons.length && buttons.filter(button => button.path===binding.value)
        console.log('%c isBtn', 'color:red;', isBtn);
        !isBtn.length && el.parentNode.removeChild(el)
        console.log('%c buttons', 'color:red;', buttons);
        //   console.log('%c vnode.context.$store.state.user.accessRoutes', 'color:red;', vnode.context.$store.state.user.accessRoutes);
        //   console.log('%c binding.value', 'color:red;', binding.value);
        //   if (permissionList && permissionList.length && !permissionList.includes(binding.value)) {
        //       el.parentNode.removeChild(el);
        //   }
      }
    });
  }
};

export default hasPermission;
