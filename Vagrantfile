# -*- mode: ruby -*-
# vi: set ft=ruby sw=2 ts=2 :

Vagrant.configure("2") do |config|
  config.vm.box = "debian/wheezy64"
  config.vm.network :private_network, ip: "10.1.1.12"
  config.vm.hostname = "lots"

  config.vm.synced_folder ".", "/vagrant", disabled: true
  config.vm.synced_folder ".", "/home/vagrant/lots"

  ["vmware_fusion", "vmware_workstation", "virtualbox"].each do |provider|
    config.vm.provider provider do |v, override|
      v.memory = "2048"
    end
  end

  config.vm.provision :ansible do |ansible|
    ansible.playbook = "provision.yml"
    ansible.extra_vars = { ansible_ssh_user: "vagrant", ansible_become: "yes" }
  end
end